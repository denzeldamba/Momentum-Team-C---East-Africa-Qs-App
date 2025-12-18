-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    client_name VARCHAR(255),
    contract_sum DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE -- Last sync timestamp
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PDF DRAWINGS
-- ============================================
CREATE TABLE drawings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT, -- Supabase Storage URL
    file_size INTEGER, -- bytes
    page_count INTEGER DEFAULT 1,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own drawings" ON drawings FOR SELECT 
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own drawings" ON drawings FOR INSERT 
    WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ============================================
-- SCALE CALIBRATIONS (Per Drawing Page)
-- ============================================
CREATE TABLE calibrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    point_a_x DECIMAL(10,4) NOT NULL, -- Canvas coordinates
    point_a_y DECIMAL(10,4) NOT NULL,
    point_b_x DECIMAL(10,4) NOT NULL,
    point_b_y DECIMAL(10,4) NOT NULL,
    real_world_distance DECIMAL(10,4) NOT NULL, -- In meters
    scale_factor DECIMAL(10,6) NOT NULL, -- Calculated: meters per pixel
    unit VARCHAR(10) DEFAULT 'm', -- m, cm, mm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(drawing_id, page_number) -- One calibration per page
);

ALTER TABLE calibrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage calibrations" ON calibrations FOR ALL 
    USING (drawing_id IN (SELECT id FROM drawings WHERE project_id IN 
        (SELECT id FROM projects WHERE user_id = auth.uid())));

-- ============================================
-- MEASUREMENTS
-- ============================================
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drawing_id UUID NOT NULL REFERENCES drawings(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL DEFAULT 1,
    measurement_type VARCHAR(50) NOT NULL, -- 'area', 'length', 'count'
    tool_type VARCHAR(50) NOT NULL, -- 'bounding_box', 'polyline', 'point'
    points JSONB NOT NULL, -- Array of {x, y} coordinates
    calculated_value DECIMAL(15,4) NOT NULL, -- The measurement result
    unit VARCHAR(10) NOT NULL, -- m², m, nr (number)
    label VARCHAR(255), -- User-added description
    color VARCHAR(7) DEFAULT '#FF0000', -- Hex color for display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    synced_at TIMESTAMP WITH TIME ZONE
);

-- Example points JSONB structure:
-- Bounding Box: [{"x": 100, "y": 200}, {"x": 300, "y": 400}]
-- Polyline: [{"x": 10, "y": 20}, {"x": 50, "y": 60}, {"x": 100, "y": 30}]

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage measurements" ON measurements FOR ALL 
    USING (drawing_id IN (SELECT id FROM drawings WHERE project_id IN 
        (SELECT id FROM projects WHERE user_id = auth.uid())));

-- ============================================
-- SMM TEMPLATES (Pre-defined calculation rules)
-- ============================================
CREATE TABLE smm_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g., "A.1.1.1"
    category VARCHAR(100) NOT NULL, -- Concrete, Walling, Finishes
    description TEXT NOT NULL,
    measurement_type VARCHAR(50) NOT NULL, -- volume, area, length, number
    unit VARCHAR(10) NOT NULL, -- m³, m², m, nr
    formula JSONB NOT NULL, -- Calculation logic
    waste_factor DECIMAL(5,4) DEFAULT 1.0, -- e.g., 1.05 = 5% waste
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example formula JSONB structure:
-- Concrete: {"type": "volume", "inputs": ["length", "width", "depth"], "calculation": "length * width * depth * waste_factor"}
-- Walling: {"type": "area", "inputs": ["length", "height"], "calculation": "length * height", "deductions": true}

-- Seed data will be inserted here (see below)

-- ============================================
-- RATES DATABASE (Material & Labor Costs)
-- ============================================
CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    smm_template_id UUID REFERENCES smm_templates(id) ON DELETE SET NULL,
    item_code VARCHAR(50), -- User-defined or linked to SMM
    description TEXT NOT NULL,
    unit VARCHAR(10) NOT NULL,
    material_cost DECIMAL(12,2) DEFAULT 0,
    labor_cost DECIMAL(12,2) DEFAULT 0,
    total_rate DECIMAL(12,2) GENERATED ALWAYS AS (material_cost + labor_cost) STORED,
    region VARCHAR(100) DEFAULT 'Nairobi', -- For location-based pricing
    is_default BOOLEAN DEFAULT FALSE, -- System-provided rates
    user_id UUID REFERENCES auth.users(id), -- NULL for system rates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all default rates" ON rates FOR SELECT USING (is_default = TRUE OR user_id = auth.uid());
CREATE POLICY "Users can manage own rates" ON rates FOR ALL USING (user_id = auth.uid());

-- ============================================
-- BILL ITEMS (Calculated from Measurements)
-- ============================================
CREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES measurements(id) ON DELETE SET NULL,
    smm_template_id UUID REFERENCES smm_templates(id) ON DELETE SET NULL,
    rate_id UUID REFERENCES rates(id) ON DELETE SET NULL,
    item_code VARCHAR(50),
    description TEXT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * rate) STORED,
    additional_data JSONB, -- For storing depth, height, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage bill items" ON bill_items FOR ALL 
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ============================================
-- PAYMENT CERTIFICATES
-- ============================================
CREATE TABLE payment_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    certificate_number INTEGER NOT NULL,
    certificate_type VARCHAR(50) DEFAULT 'interim', -- interim, final, advance
    issue_date DATE NOT NULL,
    valuation_date DATE NOT NULL,
    gross_amount DECIMAL(15,2) NOT NULL,
    previous_amount DECIMAL(15,2) DEFAULT 0,
    current_amount DECIMAL(15,2) GENERATED ALWAYS AS (gross_amount - previous_amount) STORED,
    retention_percentage DECIMAL(5,2) DEFAULT 5.0, -- 5% retention
    retention_amount DECIMAL(15,2),
    net_amount DECIMAL(15,2),
    pdf_url TEXT, -- Generated PDF stored in Supabase Storage
    notes TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- draft, issued, paid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(project_id, certificate_number)
);

ALTER TABLE payment_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage certificates" ON payment_certificates FOR ALL 
    USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- ============================================
-- CERTIFICATE LINE ITEMS (Link to Bill Items)
-- ============================================
CREATE TABLE certificate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id UUID NOT NULL REFERENCES payment_certificates(id) ON DELETE CASCADE,
    bill_item_id UUID NOT NULL REFERENCES bill_items(id) ON DELETE CASCADE,
    quantity_claimed DECIMAL(15,4) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE certificate_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage certificate items" ON certificate_items FOR ALL 
    USING (certificate_id IN (SELECT id FROM payment_certificates WHERE project_id IN 
        (SELECT id FROM projects WHERE user_id = auth.uid())));

-- ============================================
-- SYNC QUEUE (For Offline Support)
-- ============================================
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL, -- insert, update, delete
    data JSONB,
    sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, failed
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_drawings_project_id ON drawings(project_id);
CREATE INDEX idx_measurements_drawing_id ON measurements(drawing_id);
CREATE INDEX idx_bill_items_project_id ON bill_items(project_id);
CREATE INDEX idx_certificates_project_id ON payment_certificates(project_id);
CREATE INDEX idx_sync_queue_user_status ON sync_queue(user_id, sync_status);