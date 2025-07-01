import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Spinner from "../app/shared/Spinner";
import { useContext } from "react";
import { UserContext } from "./App";

const Dashboard = lazy(() => import("./dashboard/Dashboard"));
const Teachers = lazy(() => import("./database/Teachers"));
const TeachersList = lazy(() => import("./sessional-pref//TeachersList"));
const TeacherDetails = lazy(() => import("./sessional-pref//TeacherDetails"));
const Sections = lazy(() => import("./database/Sections"));
const Rooms = lazy(() => import("./database/Rooms"));
const Courses = lazy(() => import("./database/Courses"));
const Initialize = lazy(() => import("./database/Initialize"));

const TheoryPreference = lazy(() => import("./theory-pref/TheoryPreference"));
const TheorySelect = lazy(() => import("./forms/TheorySelect"));
const SessionalSelect = lazy(() => import("./forms/SessionalSelect"));
const TheoryScheduleForm = lazy(() => import("./forms/TheorySchedule"));

const TheorySchedule = lazy(() => import("./theory-schedule/AskForSchedule"));
const FixedSchedule = lazy(() => import("./theory-schedule/FixedSchedule"));

const LabRoomAssign = lazy(() => import("./lab-room-assign/LabRoomAssign"));
const SessionalSchedule = lazy(() => import("./sessional-schedule/SessionalSchedule"));

const Login = lazy(() => import("./user-pages/Login"));
const Register = lazy(() => import("./user-pages/Register"));
const ForgetPassword = lazy(() => import("./user-pages/ForgetPassword"));
const Account = lazy(() => import("./user-pages/Account"));

const pdfPage = lazy(() => import("./pdf/ShowPdf"));
const TheoryScheduleDashboardSection = lazy(() => import("./theory-schedule/TheoryScheduleDashboardSection"));


export default function AppRoutes() {
  const { user } = useContext(UserContext);

  return (
    <Suspense fallback={<Spinner />}>
      <Switch>
        <Route exact path="/form/theory-pref/:initial" component={TheorySelect} />
        <Route exact path="/form/sessional-pref/:initial" component={SessionalSelect} />
        <Route exact path="/form/theory-sched/:initial" component={TheoryScheduleForm} />
        {user.loggedIn ? (
          <Switch>
            <Route exact path="/dashboard" component={Dashboard} />
            <Route path="/database/teachers" component={Teachers} />
            <Route path="/database/sections" component={Sections} />
            <Route path="/database/rooms" component={Rooms} />
            <Route path="/database/courses" component={Courses} />
            <Route path="/database/initialize" component={Initialize} />
            <Route path="/theory-assign" component={TheoryPreference} />
            <Route path="/theory-schedule/ask" component={TheorySchedule} />
            <Route path="/theory-schedule/fixed" component={FixedSchedule} />
            <Route path="/room-assign" component={ LabRoomAssign } />
            <Route path="/lab-assign" component={ TeachersList } />
            <Route path="/lab-assign/:teacherId" component={TeacherDetails} />
            <Route path="/lab-schedule" component={ SessionalSchedule } />
            <Route path="/pdf" component={pdfPage} />
            <Route path="/theory-schedule/new" component={TheoryScheduleDashboardSection} />
            <Redirect to="/dashboard" />
          </Switch>
        ) : (
          <Switch>
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/register" component={Register} />
            <Route path="/auth/forgot-password" component={ForgetPassword} />
            <Redirect to="/auth/login" />
          </Switch>
        )}
      </Switch>
    </Suspense>
  );
}
