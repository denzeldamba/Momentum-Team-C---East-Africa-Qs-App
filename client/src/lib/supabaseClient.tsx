import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client instance
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string
);


export default supabase;
export default function Auth() {
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [session, setSession] = useState<Session | null>(null);

	const params = new URLSearchParams(window.location.search);
	const hasTokenHash = params.get("token_hash");

	const [verifying, setVerifying] = useState(!!hasTokenHash);
	const [authError, setAuthError] = useState<string | null>(null);
	const [authSuccess, setAuthSuccess] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const token_hash = params.get("token_hash");
		const type = params.get("type");

		if (token_hash) {
			supabase.auth
				.verifyOtp({
					token_hash,
					type: (type as "email" | "sms") || "email",
				})
				.then(({ error }: { error: AuthError | null }) => {
					if (error) setAuthError(error.message);
					else {
						setAuthSuccess(true);
						window.history.replaceState({}, document.title, "/");
					}
					setVerifying(false);
				});
		}

		supabase.auth
			.getSession()
			.then(({ data: { session } }) => setSession(session));

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleLogin = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: window.location.origin },
		});

		if (error) alert(error.error_description || error.message);
		else toast.success("Check thy email for the login link!");

		setLoading(false);
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		setSession(null);
	};

	const baseContainer =
		"flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4";

	// Verification state
	if (verifying) {
		return (
			<div className={baseContainer}>
				<h1 className="text-3xl font-bold mb-4">Authentication</h1>
				<p className="text-gray-700 mb-2">
					Confirming your magic link...
				</p>
				<p className="text-blue-500 font-semibold">Loading...</p>
			</div>
		);
	}

	// Error state
	if (authError) {
		return (
			<div className={baseContainer}>
				<h1 className="text-3xl font-bold mb-4">Authentication</h1>
				<p className="text-red-600 font-semibold mb-2">
					✗ Authentication failed
				</p>
				<p className="text-gray-700 mb-4">{authError}</p>
				<button
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
					onClick={() => {
						setAuthError(null);
						window.history.replaceState({}, document.title, "/");
					}}>
					Return to login
				</button>
			</div>
		);
	}

	// Success state (before session loads)
	if (authSuccess && !session) {
		return (
			<div className={baseContainer}>
				<h1 className="text-3xl font-bold mb-4">Authentication</h1>
				<p className="text-green-600 font-semibold mb-2">
					✓ Authentication successful!
				</p>
				<p className="text-gray-700">Loading your account...</p>
			</div>
		);
	}

	// Logged in
	if (session) {
		return (
			<div className={baseContainer}>
				<h1 className="text-3xl font-bold mb-4">Welcome!</h1>
				<p className="text-gray-800 mb-4">
					Your are logged in as:{" "}
					<span className="font-mono">{session.user.email}</span>
				</p>
				<button
					className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
					onClick={handleLogout}>
					Sign Out
				</button>
			</div>
		);
	}

	// Login form
	return (
		<div className={baseContainer}>
			<h1 className="text-3xl text-gray-500 font-bold mb-4">Quantity Surveying App</h1>
			<p className="text-gray-700 mb-6 text-center">
				Sign in via magic link with your email below
			</p>

			<form
				onSubmit={handleLogin}
				className="w-full max-w-sm bg-white p-6 rounded shadow-md space-y-4">
				<input
					type="email"
					placeholder="Your email"
					value={email}
					required
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>

				<button
					type="submit"
					disabled={loading}
					className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? "Loading..." : "Send magic link"}
				</button>
			</form>
		</div>
	);
}
