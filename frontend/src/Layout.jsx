import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import { Box, display } from "@mui/system";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", bgcolor:"black", flexDirection:"row"}}>
          <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", color:"white", bgcolor:"white", width:"200px", height:"200px"}}>
            Producto 1
            </Box>

        </Box>
        
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
