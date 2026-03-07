import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import SwipePage from './pages/SwipePage.jsx';
import ConfirmSelection from './pages/ConfirmSelection.jsx';
import StudyPage from './pages/StudyPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import PromptGeneratorPage from './pages/PromptGeneratorPage.jsx';
import NotFound from './pages/NotFound.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: 'swipe/:id', element: <SwipePage /> },
            { path: 'confirm/:id', element: <ConfirmSelection /> },
            { path: 'study/:id', element: <StudyPage /> },
            { path: 'results/:id', element: <ResultsPage /> },
            { path: 'prompt', element: <PromptGeneratorPage /> },
            { path: '*', element: <NotFound /> },
        ],
    },
]);

export default router;
