import { useEffect, useState, type JSX } from "react";
import { areaService } from "../../service/areaService";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

type Area = {
  id: number;
  nombre: string;
  subAreas: Area[];
};

export const Areas = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // dialog for creating child
  const [openCreate, setOpenCreate] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [childName, setChildName] = useState("");

  useEffect(() => {
    getAreas();
  }, []);

  const getAreas = async () => {
    setLoading(true);
    try {
      const data = await areaService.getAll();
      console.log("=== DATOS DEL API ===", data);

      let areasArray: Area[] = [];
      if (Array.isArray(data)) {
        areasArray = data;
      } else if (data && typeof data === "object") {
        areasArray = [data];
      }

      console.log("=== ÁREAS PROCESADAS ===", areasArray);
      setAreas(areasArray);

      // Expandir todas las áreas por defecto
      const ids = new Set<number>();
      const collect = (node: Area) => {
        ids.add(node.id);
        if (node.subAreas && Array.isArray(node.subAreas)) {
          node.subAreas.forEach((sub) => collect(sub));
        }
      };
      areasArray.forEach((a) => collect(a));
      setExpandedIds(ids);
    } catch (err) {
      console.error("ERROR cargando areas:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const openCreateFor = (pId: number | null) => {
    setParentId(pId);
    setChildName("");
    setOpenCreate(true);
  };

  const closeCreate = () => {
    setOpenCreate(false);
    setParentId(null);
    setChildName("");
  };

  const handleCreate = async () => {
    if (!childName) return;
    try {
      setLoading(true);
      const payload = { nombre: childName, parentAreaId: parentId ?? 0 };
      await areaService.create(payload);
      await getAreas();
      closeCreate();
    } catch (err) {
      console.error("Error creando area:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: Area, depth = 0): JSX.Element => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.subAreas && node.subAreas.length > 0;

    return (
      <Box key={node.id}>
        <Stack direction="row" alignItems="center" sx={{ pl: depth * 2, py: 0.5 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => toggleExpand(node.id)}
              sx={{ minWidth: 0, mr: 1 }}
            >
              {isExpanded ? <ExpandMoreIcon  /> : <ChevronRightIcon />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 40 }} />}
          <Typography variant="body2" sx={{ flex: 1 }}>
            {node.nombre}
          </Typography>
          {depth > 0 && (
            <IconButton
              size="small"
              onClick={() => openCreateFor(node.id)}
             
            >
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        {hasChildren && isExpanded && (
          <Box>
            {node.subAreas.map((child) => renderNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Áreas ({areas.length})</Typography>
        <Button variant="contained" onClick={() => openCreateFor(null)}>
          Crear raíz
        </Button>
      </Stack>

      {loading && (
        <Typography color="info" sx={{ mb: 2 }}>
          Cargando...
        </Typography>
      )}

      <Box
        sx={{
          border: "1px solid #ddd",
          p: 2,
          borderRadius: 1,
          bgcolor: "#fafafa",
          minHeight: "300px",
        }}
      >
        {areas.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay áreas disponibles
          </Typography>
        ) : (
          <Box>{areas.map((a) => renderNode(a, 0))}</Box>
        )}
      </Box>

      <Dialog open={openCreate} onClose={closeCreate} fullWidth maxWidth="sm">
        <DialogTitle>Crear área</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Parent area id: {parentId ?? "Raíz"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreate}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!childName}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Areas;
