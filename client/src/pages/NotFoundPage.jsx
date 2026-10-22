import { Link } from 'react-router-dom';
import { EmptyState } from '../components/StateViews.jsx';

export default function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      <p>This address doesn’t match any page in the portal.</p>
      <Link to="/" className="button button--secondary">
        Back to tickets
      </Link>
    </EmptyState>
  );
}
