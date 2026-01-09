import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-start">
      <IconButton
        onClick={() => navigate(-1)} // Navigate back
        color="primary"
        sx={{
          borderRadius: "8px", // Rounded corners for a smooth feel
          padding: "10px", // Ensures it looks more like a button
        }}
      >
        <ArrowBackIcon sx={{ color: "white" }} />
      </IconButton>
    </div>
  );
}

export default BackButton;
