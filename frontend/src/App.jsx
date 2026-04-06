import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Member4Panel from "./pages/Member4Panel";

function App() {
  return (
    <div className="d-flex" id="wrapper">
      <Sidebar />

      <div id="page-content-wrapper" className="w-100">
        <Navbar />
        <div className="container-fluid p-4">
          <Routes>
            <Route path="/" element={<Member4Panel />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
