import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="page-center">
            <div className="empty-state animate-fade-in">
                <div className="empty-state-icon">🔍</div>
                <h2>404 — Page Not Found</h2>
                <p>This page doesn't exist.</p>
                <Link to="/" className="btn btn-primary mt-lg">Go Home</Link>
            </div>
        </div>
    );
}
