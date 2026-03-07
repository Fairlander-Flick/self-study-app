import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const location = useLocation();

    return (
        <nav className="navbar" role="navigation" aria-label="Main navigation">
            <Link to="/" className="navbar-brand">
                🧠 <span>StudyFlick</span>
            </Link>

            <div className="flex items-center gap-sm">
                <Link
                    to="/prompt"
                    className={`btn btn-ghost btn-sm ${location.pathname === '/prompt' ? 'btn-secondary' : ''}`}
                    title="Generate AI Prompt"
                >
                    ✨ Magic Prompt
                </Link>
            </div>
        </nav>
    );
}
