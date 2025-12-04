import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  ImageList,
  ImageListItem,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { reclamosService } from "../../service/reclamosService";
import toast from "react-hot-toast";
import { useSpinner } from "../../components/share/context/SpinnerContext";

import useAuth from "../../hook/useAthu";

type Reclamo = {
  id: number | string;
  titulo: string;
  estado: string;
  fechaCreacion: string; // ISO string or date-like
  usuarioNombre: string;
  imagenes?: string[];
  [key: string]: any;
  descripcion?: string;
  presupuesto:string;
  costo:number;
};

export const Reclamos = () => {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [openReclamo, setOpenReclamo] = useState<Reclamo | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string>("");
  const { showSpinner, hideSpinner } = useSpinner();
  const [newFile, setnewFile] = useState<File | null>(null);
  const {user} = useAuth();
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const data = await reclamosService.getAll();
    // ensure fechaCreacion exists and is string
    setReclamos(Array.isArray(data) ? data : []);
  };

  const filteredAndSorted = useMemo(() => {
    const parsed = reclamos.map((r) => ({
      ...r,
      fechaCreacion: r.fechaCreacion,
    }));

    let filtered = parsed;

    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter((r) => new Date(r.fechaCreacion) >= s);
    }
    if (endDate) {
      // include whole day
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.fechaCreacion) <= e);
    }

    // sort by fechaCreacion desc (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.fechaCreacion).getTime() -
        new Date(a.fechaCreacion).getTime()
    );
    return filtered;
  }, [reclamos, startDate, endDate]);

  const handleOpen = (r: Reclamo) => {
    setOpenReclamo(r);
    setSelectedEstado(r.estado || "");
  };

  const handleClose = () => setOpenReclamo(null);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const buildImageUrl = (imagePath: string) => {
    // La ruta viene como: "wwwroot/reclamos\\43122646-9f83-4d66-85e0-010d01addc45_LAJBLIYY7JHFZBYFFUV6OYZMOU.avif"
    // El navegador necesita una URL HTTP, no una ruta local
    // El backend debe servir las imágenes como archivos estáticos desde wwwroot
    const cleanPath = imagePath.replace(/\\/g, "/");
    // Ajusta el puerto según tu backend (.NET usa típicamente 5000, 5001 o 44332)
    return `http://localhost:80/images/${cleanPath}`;
  };

  // const handleSaveEstado = async () => {
  //   if (!openReclamo) return;
  //   const updated: Reclamo = { ...openReclamo, estado: selectedEstado };

  //   // Actualizamos localmente la lista para reflejar el cambio en la UI
  //   setReclamos((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  //   setOpenReclamo(updated);

  //   // Si más adelante integras el service, puedes implementar reclamosService.updateStatus
  //   // if ((reclamosService as any).updateStatus) {
  //   const dataToUpdate = {
  //     id: updated.id,
  //     tipo: updated.titulo,
  //     descripcion: updated.descripcion,
  //     usuarioId: updated.usuarioId,
  //     reclamo: "string",
  //   };
  //   try {
  //     showSpinner();
  //     const response = await reclamosService.update(dataToUpdate);
  //     console.log("Reclamo actualizado:", response);
  //     toast.success("Estado actualizado correctamente");
  //   } catch (err) {
  //     toast.error("Error al actualizar el estado");
  //   } finally {
  //     hideSpinner();
  //   }
  //   // } else {
  //   //   console.log("Stub save estado:", updated.id, selectedEstado);
  //   // }
  // };


  const handleSaveEstado = async () => {
  if (!openReclamo) return;

  const updated: Reclamo = {
    ...openReclamo,
    estado: selectedEstado,
 
  };

  // Optimistic UI
  setReclamos((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  setOpenReclamo(updated);

  // --- ARMAR FORM DATA ---
  const formData = new FormData();

  formData.append("Id", updated.id.toString());
  formData.append("Titulo", updated.titulo);
  formData.append("Tipo", updated.titulo);
  formData.append("Reclamo","string");
  formData.append("Descripcion", updated.descripcion || "");
  formData.append("AreaId", updated.areaId.toString());
  formData.append("UsuarioId",user?.userId?.toString() ?? "0");
  formData.append("Costo", openReclamo.cotizacion?.toString() ?? "0");
  formData.append("Estado", updated.estado);

  // Solo agregar archivo si existe
  if (newFile) {
    formData.append("PresupuestoArchivo", newFile);
  }

  try {
    showSpinner();

    const response = await reclamosService.update(formData);

    console.log("Reclamo actualizado:", response);
    toast.success("Estado actualizado correctamente");
  } catch (err) {
    console.error(err);
    toast.error("Error al actualizar el reclamo");
  } finally {
    hideSpinner();
  }
};

  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        mb={2}
        alignItems="center"
        sx={{
          background: "#100f0fff",
          padding: "20px",
        }}
      >
        <Typography variant="h6" sx={{ color: "white" }}>
          Reclamos
        </Typography>

        <TextField
          label="Fecha desde"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{
            color: "black !important",
            background: "#c5c5c5ff",
          }}
        />

        <TextField
          label="Fecha hasta"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          sx={{
            color: "black !important",
            background: "#c5c5c5ff",
          }}
        />

        <Button
          variant="outlined"
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          sx={{
            color: "black",
            background: "#ffffffff",
            borderColor: "#ffffffff",
            "&:hover": { borderColor: "#deddddff" },
          }}
        >
          Limpiar
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSorted.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.titulo}</TableCell>
                <TableCell>{r.estado}</TableCell>
                <TableCell>{formatDate(r.fechaCreacion)}</TableCell>
                <TableCell>{r.usuarioNombre}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(r)}>
                    <VisibilityIcon style={{ color: "white" }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={Boolean(openReclamo)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle Reclamo</DialogTitle>
        <DialogContent dividers>
          {openReclamo ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {openReclamo.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado: {openReclamo.estado}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fecha creación: {formatDate(openReclamo.fechaCreacion)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Usuario: {openReclamo.usuarioNombre}
              </Typography>
              {openReclamo.descripcion && (
                <Box mt={2}>
                  <Typography variant="body2">Descripción:</Typography>
                  <Typography variant="body1">
                    {openReclamo.descripcion}
                  </Typography>
                </Box>
              )}

              <Box mt={2}>
                <FormControl
                  fullWidth
                  size="small"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#fff",
                    },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      { borderColor: "#fff" },
                    "& .MuiInputLabel-root": { color: "#fff" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#fff" },
                    "& .MuiSelect-select": { color: "#fff" },
                    "& .MuiSvgIcon-root": { color: "#fff" },
                  }}
                >
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    value={selectedEstado}
                    label="Estado"
                    onChange={(e) =>
                      setSelectedEstado(e.target.value as string)
                    }
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En curso">En curso</MenuItem>
                    <MenuItem value="En cotizacion">En cotizacion</MenuItem>
                    <MenuItem value="Finaliazado">Finaliazado</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {selectedEstado === "En cotizacion" && (
                <>
                  <Box mt={2}>
                    <TextField
                      label="Monto de Cotización"
                      type="number"
                      sx={{
                        borderColor:'white'
                      }}
                      fullWidth
                      variant="outlined"
                      value={openReclamo.cotizacion}
                      onChange={(e) => {
                        const cotizacion = e.target.value;
                        setOpenReclamo((prev) =>
                          prev ? { ...prev, cotizacion } : prev
                        );
                      }}
                    />
                  </Box>
                 
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Presupuesto (opcional)
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <Button variant="outlined" component="label"
                        sx={{
                          color:'black',
                          background:'white'
                        }}
                      >
                        Seleccionar archivo
                        <input
                          hidden
                          type="file"
                          onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                              setnewFile(f);
                            }
                          }}
                        />
                      </Button>
                    </Stack>
                    {newFile && (
                      <Typography variant="body2" sx={{ mt: 1, color:'white' }}>
                        Archivo seleccionado: {newFile.name}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
              {
               ( openReclamo.presupuesto !== "")&& (
                <>
                  <Box mt={2}>
                    <Typography variant="body2">Presupuesto:</Typography>
                    <span>
                      <a href={buildImageUrl(openReclamo.presupuesto)}>Descargar</a>
                    </span>
                  </Box>
                </>
               )
              }
              {openReclamo.imagenes && openReclamo.imagenes.length > 0 && (
                <Box mt={3}>
                  <Typography variant="body2" gutterBottom>
                    Imágenes:
                  </Typography>
                  <ImageList
                    sx={{ width: "100%", height: "auto" }}
                    cols={2}
                    gap={8}
                  >
                    {openReclamo.imagenes.map(
                      (imagen: string, index: number) => (
                        <ImageListItem key={index}>
                          <img
                            src={buildImageUrl(imagen)}
                            alt={`Reclamo ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                            onError={(e) => {
                              // Si la imagen no carga, mostramos la ruta
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </ImageListItem>
                      )
                    )}
                  </ImageList>
                </Box>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveEstado}
          >
            Guardar
          </Button>
          <Button onClick={handleClose} sx={{ color: "#fff" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reclamos;
