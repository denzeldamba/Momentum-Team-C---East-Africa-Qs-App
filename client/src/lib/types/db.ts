export interface Project {
	id: string;
	user_id: string;
	name: string;
	location?: string | null;
	client_name?: string | null;
	contract_sum?: number | null;
	status: "active" | "completed" | "archived";
	created_at: string;
	updated_at: string;
	synced_at?: string | null;
}

export interface Drawing {
	id: string;
	project_id: string;
	file_name: string;
	file_url?: string | null;
	file_path: string;
	mime_type?: string | null;
	file_size?: number | null;
	page_count: number;
	upload_date: string;
	created_at: string;
	synced_at?: string | null;
}

export interface Calibration {
	id: string;
	drawing_id: string;
	page_number: number;
	point_a_x: number;
	point_a_y: number;
	point_b_x: number;
	point_b_y: number;
	real_world_distance: number;
	scale_factor: number;
	unit: string; // 'm', 'cm', 'mm'
	created_at: string;
	created_by?: string | null;
}

export interface Measurement {
	id: string;
	drawing_id: string;
	page_number: number;
	measurement_type: string; // 'area', 'length', 'count'
	tool_type: string; // 'bounding_box', 'polyline', 'point'
	points: Array<{ x: number; y: number }>;
	calculated_value: number;
	unit: string; // m², m, nr
	label?: string | null;
	color: string;
	created_at: string;
	updated_at: string;
	created_by?: string | null;
	synced_at?: string | null;
}

export interface SMMTemplate {
	id: string;
	code: string;
	category: string;
	description: string;
	measurement_type: string;
	unit: string;
	formula: any; // JSONB
	waste_factor: number;
	is_active: boolean;
	display_order?: number | null;
	created_at: string;
}

export interface Rate {
	id: string;
	smm_template_id?: string | null;
	item_code?: string | null;
	description: string;
	unit: string;
	material_cost: number;
	labor_cost: number;
	total_rate: number;
	region: string;
	is_default: boolean;
	user_id?: string | null;
	created_at: string;
	updated_at: string;
}

export interface BillItem {
	id: string;
	project_id: string;
	measurement_id?: string | null;
	smm_template_id?: string | null;
	rate_id?: string | null;
	item_code?: string | null;
	description: string;
	quantity: number;
	unit: string;
	rate: number;
	amount: number;
	additional_data?: any | null; // JSONB
	created_at: string;
	updated_at: string;
	synced_at?: string | null;
}

export interface PaymentCertificate {
	id: string;
	project_id: string;
	certificate_number: number;
	certificate_type: "interim" | "final" | "advance";
	issue_date: string;
	valuation_date: string;
	gross_amount: number;
	previous_amount: number;
	current_amount: number;
	retention_percentage: number;
	retention_amount?: number | null;
	net_amount?: number | null;
	pdf_url?: string | null;
	file_path: string;
	file_name?: string | null;
	file_size?: number | null;
	notes?: string | null;
	status: "draft" | "issued" | "paid";
	created_at: string;
	created_by?: string | null;
}

export interface CertificateItem {
	id: string;
	certificate_id: string;
	bill_item_id: string;
	quantity_claimed: number;
	amount: number;
	created_at: string;
}

export interface SyncQueue {
	id: string;
	user_id: string;
	table_name: string;
	record_id: string;
	operation: "insert" | "update" | "delete";
	data?: any | null;
	sync_status: "pending" | "synced" | "failed";
	retry_count: number;
	error_message?: string | null;
	created_at: string;
	synced_at?: string | null;
}
