import { lazy } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// These pages download only when first opened, so the app starts faster.
// Layout shows a spinner while they load.
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Words = lazy(() => import("./pages/Words"));
const Courses = lazy(() => import("./pages/Courses"));
const Course = lazy(() => import("./pages/Course"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Practice = lazy(() => import("./pages/Practice"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Progress = lazy(() => import("./pages/Progress"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminItems = lazy(() => import("./pages/admin/AdminItems"));
const AdminItemEdit = lazy(() => import("./pages/admin/AdminItemEdit"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseEdit = lazy(() => import("./pages/admin/AdminCourseEdit"));
const AdminLessonEdit = lazy(() => import("./pages/admin/AdminLessonEdit"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminImport = lazy(() => import("./pages/admin/AdminImport"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// A new key per lesson resets the lesson's state when moving to the next one
function LessonPage() {
  const { lessonId } = useParams();
  return <Lesson key={lessonId} />;
}

const loggedIn = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Open to everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/words" element={<Words />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<Course />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Needs a login */}
        <Route path="/courses/:courseId/lessons/:lessonId" element={loggedIn(<LessonPage />)} />
        <Route path="/practice" element={loggedIn(<Practice />)} />
        <Route path="/progress" element={loggedIn(<Progress />)} />
        <Route path="/account" element={loggedIn(<Account />)} />

        {/* The old flashcards link still works */}
        <Route path="/flashcards" element={<Navigate to="/practice" replace />} />

        {/* Admins only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminItems />} />
          <Route path="items/:itemId" element={<AdminItemEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/:courseId" element={<AdminCourseEdit />} />
          <Route path="courses/:courseId/lessons/:lessonId" element={<AdminLessonEdit />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
