import React, { FC } from 'react';
import { Suspense } from 'react';
import { Routes, Route, RouteProps } from 'react-router';

import Loading from "@components/Loading/Loading";
import NotFound from "@pages/NotFound/NotFound";

const Home = React.lazy(() => import("@pages/Home/Home"));

// 定义路有集合
export const routes: RouteProps[] = [
  {
    path: "/",
    element: <Home />,
  }
];

export const RoutesList: FC = () => {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          {
            routes.map((r, index) => {
              const { path, element } = r;
              return (
                < Route
                  path={path}
                  element={element}
                />
              )
            })
          }
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
