import { Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { TaxGroupDetailPage } from './TaxGroupDetailPage';
import { TaxGroupDetailPageSkeleton } from './TaxGroupDetailPageSkeleton';
import { TaxGroupsPage } from './TaxGroupsPage';

const routes: RouteObject[] = [
  { index: true, element: <TaxGroupsPage /> },
  { path: ':taxGroupSlug', element: <Navigate to="overview" replace /> },
  {
    path: ':taxGroupSlug/:tab',
    element: (
      <Suspense fallback={<TaxGroupDetailPageSkeleton />}>
        <TaxGroupDetailPage />
      </Suspense>
    ),
  },
];

export default routes;
