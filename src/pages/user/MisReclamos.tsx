// Clean, single implementation of MisReclamos
import { useEffect, useMemo, useState, type JSX } from "react";
import { useSpinner } from "../../components/share/context/SpinnerContext";
import { reclamosService } from "../../service/reclamosService";
import { areaService } from "../../service/areaService";

import useAuth from "../../hook/useAthu";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  IconButton,
  Stack,
} from "@mui/material";

type Reclamo = {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaCreacion: string;
  estado: string;
  usuarioId?: number;
};

type Area = {
  id: number;
  nombre: string;
  subAreas: Area[];
};

const MisReclamos = (): JSX.Element => {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const { showSpinner, hideSpinner } = useSpinner();
  const { user } = useAuth();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<Reclamo | null>(null);

  // create reclamo modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const getData = async () => {
    try {
      if (!user) return;
      const id = typeof (user as any).userId === "string" ? Number((user as any).userId) : (user as any).userId;
      if (!id) return;
      showSpinner?.();
      const data = await reclamosService.getByUserId(Number(id));
      setReclamos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      hideSpinner?.();
    }
  };

  const openCreateModal = async () => {
    setOpenCreate(true);
    try {
      const data = await areaService.getAll();
      let areasArray: Area[] = [];
      if (Array.isArray(data)) areasArray = data;
      else if (data && typeof data === "object") areasArray = [data];
      setAreas(areasArray);

      // expand all by default
      const ids = new Set<number>();
      const collect = (node: Area) => {
        ids.add(node.id);
        if (node.subAreas && Array.isArray(node.subAreas)) node.subAreas.forEach((s) => collect(s));
      };
      areasArray.forEach((a) => collect(a));
      setExpandedIds(ids);
    } catch (err) {
      console.error("Error cargando areas para crear reclamo:", err);
    }
  };

  const closeCreateModal = () => {
    setOpenCreate(false);
    setNewTitle("");
    setNewDesc("");
    setNewImage(null);
    setPreviewUrl(null);
    setSelectedAreaId(null);
    setIsCreating(false);
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const renderNode = (node: Area, depth = 0): JSX.Element => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.subAreas && node.subAreas.length > 0;

    return (
      <Box key={node.id}>
        <Stack direction="row" alignItems="center" sx={{ pl: depth * 2, py: 0.5 }}>
          {hasChildren ? (
            <IconButton size="small" onClick={() => toggleExpand(node.id)} sx={{ minWidth: 0, mr: 1 }}>
              {isExpanded ? "-" : "+"}
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}
          <Typography
            variant="body2"
            sx={{ flex: 1, cursor: "pointer", fontWeight: selectedAreaId === node.id ? "bold" : "normal" }}
            onClick={() => setSelectedAreaId(node.id)}
          >
            {node.nombre}
          </Typography>
        </Stack>
        {hasChildren && isExpanded && <Box>{node.subAreas.map((c) => renderNode(c, depth + 1))}</Box>}
      </Box>
    );
  };

  const sorted = useMemo(() => {
    return [...reclamos].sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }, [reclamos]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDetalle = (r: Reclamo) => {
    setSelected(r);
    setOpenDialog(true);
  };

  const closeDetalle = () => {
    setOpenDialog(false);
    setSelected(null);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

//   const submitCreate = async () => {
//     if (!newTitle) return;
//     setIsCreating(true);
//     try {
//       showSpinner?.();
//       const usuarioId = typeof (user as any).userId === "string" ? Number((user as any).userId) : (user as any).userId;

//       const formData = new FormData();
//       // adjust field names below if backend expects different keys
//       formData.append("titulo", newTitle);
//       formData.append("descripcion", newDesc || "");
//       if (usuarioId) formData.append("usuarioId", String(usuarioId));
//       if (selectedAreaId) formData.append("areaId", String(selectedAreaId));
//       if (newImage) formData.append("imagen", newImage);

//       const created: any = await reclamosService.create(formData);

//       if (created && created.id) {
//         setReclamos((prev) => [created, ...prev]);
//       } else {
//         const id = Date.now();
//         const fallback: Reclamo = {
//           id,
//           titulo: newTitle,
//           descripcion: newDesc,
//           fechaCreacion: new Date().toISOString(),
//           estado: "Pendiente",
//           usuarioId: usuarioId ?? undefined,
//         };
//         setReclamos((prev) => [fallback, ...prev]);
//       }

//       closeCreateModal();
//     } catch (err) {
//       console.error("Error creando reclamo:", err);
//     } finally {
//       hideSpinner?.();
//       setIsCreating(false);
//     }
//   };


const submitCreate = async () => {
  if (!newTitle) return;
  setIsCreating(true);
  try {
    showSpinner?.();
    const usuarioId =
      typeof (user as any).userId === "string"
        ? Number((user as any).userId)
        : (user as any).userId;

    const formData = new FormData();
    formData.append("Titulo", newTitle);
    formData.append("Descripcion", newDesc || "");
    if (usuarioId) formData.append("UsuarioId", String(usuarioId));
    if (selectedAreaId) formData.append("AreaId", String(selectedAreaId));

    // Subimos solo una imagen, pero usamos el nombre plural
    if (newImage) {
      formData.append("Imagenes", newImage);
    }

    const created: any = await reclamosService.create(formData);

    if (created && created.id) {
      setReclamos((prev) => [created, ...prev]);
    } else {
      const id = Date.now();
      const fallback: Reclamo = {
        id,
        titulo: newTitle,
        descripcion: newDesc,
        fechaCreacion: new Date().toISOString(),
        estado: "Pendiente",
        usuarioId: usuarioId ?? undefined,
      };
      setReclamos((prev) => [fallback, ...prev]);
    }

    closeCreateModal();
  } catch (err) {
    console.error("Error creando reclamo:", err);
  } finally {
    hideSpinner?.();
    setIsCreating(false);
  }
};

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Mis Reclamos</Typography>
        <Button variant="contained" onClick={openCreateModal}>
          Crear Reclamo
        </Button>
      </Stack>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.titulo}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>{formatDate(r.fechaCreacion)}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openDetalle(r)}>
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <Dialog open={openDialog} onClose={closeDetalle} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle Reclamo</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="h6">{selected.titulo}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado: {selected.estado}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fecha: {formatDate(selected.fechaCreacion)}
              </Typography>
              <Typography variant="body1">{selected.descripcion}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetalle}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="sm">
        <DialogTitle>Crear Reclamo</DialogTitle>
        <DialogContent>
          <TextField label="Título" fullWidth value={newTitle} onChange={(e) => setNewTitle(e.target.value)} sx={{ mt: 1 }} />
          <TextField label="Descripción" fullWidth multiline minRows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} sx={{ mt: 1 }} />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Área</Typography>
            <Box sx={{ border: "1px solid #ccc", p: 1, borderRadius: 1, maxHeight: 240, overflow: "auto", bgcolor: "background.paper" }}>
              {areas.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No hay áreas</Typography>
              ) : (
                <Box>{areas.map((a) => renderNode(a, 0))}</Box>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              Área seleccionada: {selectedAreaId ?? "Ninguna"}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Imagen (opcional)</Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Button variant="outlined" component="label">
                Seleccionar imagen
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) {
                      setNewImage(f);
                      const url = URL.createObjectURL(f);
                      setPreviewUrl(url);
                    }
                  }}
                />
              </Button>
              {previewUrl && <Box component="img" src={previewUrl} sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }} />}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateModal}>Cancelar</Button>
          <Button variant="contained" onClick={submitCreate} disabled={!newTitle || isCreating}>
            {isCreating ? "Creando..." : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MisReclamos;

