import React from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRoleSelect = (role: "admin" | "dlsl") => {
    navigate(`/login?role=${role}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%),
          repeating-linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.03)} 0px, ${alpha(theme.palette.primary.main, 0.03)} 2px, transparent 2px, transparent 4px),
          repeating-linear-gradient(-45deg, ${alpha(theme.palette.secondary.main, 0.03)} 0px, ${alpha(theme.palette.secondary.main, 0.03)} 2px, transparent 2px, transparent 4px)
        `,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "40%",
          height: "40%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          zIndex: 0,
        }}
      />

      {/* Pattern overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 100% 100%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
            radial-gradient(circle at 0% 0%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: isMobile ? 4 : 8,
          }}
        >
          <Typography
            variant={isMobile ? "h3" : "h2"}
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main,
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              px: 2,
            }}
          >
            DLSL Lost and Found
          </Typography>

          <Typography
            variant={isMobile ? "h6" : "h5"}
            align="center"
            color="text.secondary"
            sx={{ mb: isMobile ? 4 : 8, px: 2 }}
          >
            Please select your role to continue
          </Typography>

          <Grid container spacing={isMobile ? 2 : 4} justifyContent="center">
            {/* DLSL Role Card - Now First */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleRoleSelect("dlsl")}
                  sx={{ height: "100%" }}
                >
                  <CardContent
                    sx={{
                      p: isMobile ? 3 : 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? 80 : 100,
                        height: isMobile ? 80 : 100,
                        borderRadius: "50%",
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: isMobile ? 2 : 3,
                      }}
                    >
                      <SchoolIcon
                        sx={{ 
                          fontSize: isMobile ? 40 : 50, 
                          color: theme.palette.primary.main 
                        }}
                      />
                    </Box>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      component="h2" 
                      gutterBottom
                    >
                      DLSL Student / Faculty / Staff
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                    >
                      Access the lost and found system as a DLSL community member
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            {/* Admin Role Card - Now Second */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s ease",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleRoleSelect("admin")}
                  sx={{ height: "100%" }}
                >
                  <CardContent
                    sx={{
                      p: isMobile ? 3 : 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: isMobile ? 80 : 100,
                        height: isMobile ? 80 : 100,
                        borderRadius: "50%",
                        background: alpha(theme.palette.primary.main, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: isMobile ? 2 : 3,
                      }}
                    >
                      <AdminPanelSettingsIcon
                        sx={{ 
                          fontSize: isMobile ? 40 : 50, 
                          color: theme.palette.primary.main 
                        }}
                      />
                    </Box>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      component="h2" 
                      gutterBottom
                    >
                      Admin
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
                    >
                      Access the admin portal to manage lost and found items
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: isMobile ? 4 : 8 }}
          >
            Student Discipline and Formation Office (SDFO)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RoleSelectionPage; 