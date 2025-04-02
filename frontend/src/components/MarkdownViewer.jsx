import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Typography, Paper } from "@mui/material";
import Navbar from "../Navbar";
import PropTypes from "prop-types";

const MarkdownViewer = ({ filePath }) => {
  const [contenido, setContenido] = useState("");

  useEffect(() => {
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => setContenido(text))
      .catch((err) => console.error("Error al cargar el archivo:", err));
  }, [filePath]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 10, p: 2 }}>
      <Navbar />
      <Box sx={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 1,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            maxWidth: "100%",
            overflow: "auto",
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="body1" component="div" sx={{ color: "#555", lineHeight: 1.7 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{contenido}</ReactMarkdown>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
MarkdownViewer.propTypes = {
  filePath: PropTypes.string.isRequired,
};

export default MarkdownViewer;

