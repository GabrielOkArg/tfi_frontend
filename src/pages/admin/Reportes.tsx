// import { useState, useEffect, useMemo, useRef } from "react";
// import { useSpinner } from "../../components/share/context/SpinnerContext";
// import { reclamosService } from "../../service/reclamosService";
// import { areaService } from "../../service/areaService";
// import toast from "react-hot-toast";

// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// import {
//   Card,
//   CardContent,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Box,
//   Stack,
//   TextField,
//   Button
// } from "@mui/material";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   ResponsiveContainer,
//   Cell
// } from "recharts";

// export const Reportes = () => {
//   const { showSpinner, hideSpinner } = useSpinner();

//   const [reportes, setReportes] = useState([]);
//   const [areas, setAreas] = useState([]);
//   const [selectedArea, setSelectedArea] = useState<number | "">("");

//   // Filtros por fecha
//   const [fechaDesde, setFechaDesde] = useState("");
//   const [fechaHasta, setFechaHasta] = useState("");

//   // Referencia para exportar a PDF
//   const pdfRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     getData();
//   }, []);

//   const getData = async () => {
//     try {
//       showSpinner?.();
//       const responseReportes = await reclamosService.getAll();
//       setReportes(responseReportes);

//       const responseAreas = await areaService.getAll();
//       setAreas(responseAreas);
//     } catch (error) {
//       toast.error("Error al cargar los reportes");
//     } finally {
//       hideSpinner?.();
//     }
//   };

//   // 🔹 Convierte áreas recursivamente en lista plana con indentación
//   const flattenAreas = (areas: any[], level = 0): any[] => {
//     let result: any[] = [];

//     areas.forEach((area) => {
//       result.push({
//         id: area.id,
//         nombre: `${"— ".repeat(level)}${area.nombre}`
//       });

//       if (area.subAreas?.length > 0) {
//         result = result.concat(flattenAreas(area.subAreas, level + 1));
//       }
//     });

//     return result;
//   };

//   const areasPlanas = useMemo(() => flattenAreas(areas), [areas]);

//   // 🔹 Aplica filtros
//   const reportesFiltrados = useMemo(() => {
//     return reportes.filter((r: any) => {
//       const coincideArea = !selectedArea || r.areaId === selectedArea;

//       const fecha = new Date(r.fechaCreacion);
//       const desdeOK = !fechaDesde || fecha >= new Date(fechaDesde);
//       const hastaOK = !fechaHasta || fecha <= new Date(fechaHasta);

//       return coincideArea && desdeOK && hastaOK;
//     });
//   }, [selectedArea, fechaDesde, fechaHasta, reportes]);

//   // 🔹 Gráfico 1: Reclamos por área
//   const reclamosPorArea = useMemo(() => {
//     const map = new Map();

//     reportesFiltrados.forEach((r: any) => {
//       const area = r.areaNombre || "Sin área";
//       map.set(area, (map.get(area) || 0) + 1);
//     });

//     return Array.from(map).map(([name, value]) => ({ name, value }));
//   }, [reportesFiltrados]);

//   // 🔹 Gráfico 2: Reclamos por estado
//   const reclamosPorEstado = useMemo(() => {
//     const map = new Map();

//     reportesFiltrados.forEach((r: any) => {
//       const estado = r.estado || "Sin estado";
//       map.set(estado, (map.get(estado) || 0) + 1);
//     });

//     return Array.from(map).map(([name, value]) => ({ name, value }));
//   }, [reportesFiltrados]);

//   // 🔹 Gráfico 3: Finalizados por área
//   const finalizadosPorArea = useMemo(() => {
//     const map = new Map();

//     reportesFiltrados
//       .filter((r: any) => r.estado?.toLowerCase() === "finalizado")
//       .forEach((r: any) => {
//         const area = r.areaNombre || "Sin área";
//         map.set(area, (map.get(area) || 0) + 1);
//       });

//     return Array.from(map).map(([name, value]) => ({ name, value }));
//   }, [reportesFiltrados]);

//   const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

//   // 🔹 Exportar todo el panel a PDF
//   const exportToPDF = async () => {
//     if (!pdfRef.current) return;

//     const canvas = await html2canvas(pdfRef.current, {
//       scale: 2,
//       backgroundColor: "#ffffff"
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");

//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save("reportes.pdf");
//   };

//   return (
//     <Box p={3} ref={pdfRef}>
//       <Typography variant="h4" mb={3} fontWeight="bold">
//         Reportes
//       </Typography>

//       {/* FILTROS */}
//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
//             {/* Filtro Área */}
//             <FormControl fullWidth>
//               <InputLabel>Filtrar por Área</InputLabel>
//               <Select
//                 value={selectedArea}
//                 label="Filtrar por Área"
//                 onChange={(e) => setSelectedArea(e.target.value as number)}
//               >
//                 <MenuItem value="">Todas</MenuItem>

//                 {areasPlanas.map((a: any) => (
//                   <MenuItem key={a.id} value={a.id}>
//                     {a.nombre}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             {/* Fecha Desde */}
//             <TextField
//               label="Desde"
//               type="date"
//               InputLabelProps={{ shrink: true }}
//               fullWidth
//               value={fechaDesde}
//               onChange={(e) => setFechaDesde(e.target.value)}
//               sx={{
//                 color:'white'
//               }}
//             />

//             {/* Fecha Hasta */}
//             <TextField
//               label="Hasta"
//               type="date"
//               InputLabelProps={{ shrink: true }}
//               fullWidth
//               value={fechaHasta}
//               onChange={(e) => setFechaHasta(e.target.value)}
//             />
//           </Stack>
//         </CardContent>
//       </Card>

//       {/* BOTÓN EXPORTAR */}
//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={exportToPDF}>
//           Exportar PDF
//         </Button>
//       </Box>

//       {/* Charts */}
//       <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
//         {/* Gráfico barras por área */}
//         <Box flex={1}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" mb={2}>
//                 Cantidad de Reclamos por Área
//               </Typography>

//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={reclamosPorArea}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis allowDecimals={false} />
//                   <Tooltip />
//                   <Bar dataKey="value">
//                     {reclamosPorArea.map((_, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Box>

//         {/* Gráfico torta por estado */}
//         <Box flex={1}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" mb={2}>
//                 Reclamos por Estado
//               </Typography>

//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={reclamosPorEstado}
//                     dataKey="value"
//                     nameKey="name"
//                     outerRadius={120}
//                     label
//                   >
//                     {reclamosPorEstado.map((_, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Box>
//       </Stack>

//       {/* Nuevo gráfico: Finalizados por área */}
//       <Card sx={{ mb: 3 }}>
//         <CardContent>
//           <Typography variant="h6" mb={2}>
//             Reclamos FINALIZADOS por Área
//           </Typography>

//           <ResponsiveContainer width="100%" height={350}>
//             <BarChart data={finalizadosPorArea}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Bar dataKey="value" fill="#4caf50">
//                 {finalizadosPorArea.map((_, i) => (
//                   <Cell key={i} fill="#4caf50" />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Lista */}
//       <Card>
//         <CardContent>
//           <Typography variant="h6" mb={2}>
//             Lista de Reclamos ({reportesFiltrados.length})
//           </Typography>

//           {reportesFiltrados.map((r: any) => (
//             <Box
//               key={r.id}
//               p={2}
//               mb={1}
//               sx={{ border: "1px solid #ddd", borderRadius: "8px" }}
//             >
//               <Typography>
//                 <strong>{r.titulo}</strong>
//               </Typography>
//               <Typography>Área: {r.areaNombre}</Typography>
//               <Typography>Estado: {r.estado}</Typography>
//               <Typography>
//                 Fecha: {new Date(r.fechaCreacion).toLocaleDateString()}
//               </Typography>
//             </Box>
//           ))}
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };


import { useState, useEffect, useMemo, useRef } from "react";
import { useSpinner } from "../../components/share/context/SpinnerContext";
import { reclamosService } from "../../service/reclamosService";
import { areaService } from "../../service/areaService";
import toast from "react-hot-toast";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Stack,
  TextField,
  Button
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell
} from "recharts";

export const Reportes = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [reportes, setReportes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState<number | "">("");

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      showSpinner?.();
      const responseReportes = await reclamosService.getAll();
      setReportes(responseReportes);

      const responseAreas = await areaService.getAll();
      setAreas(responseAreas);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      hideSpinner?.();
    }
  };

  const flattenAreas = (areas: any[], level = 0): any[] => {
    let result: any[] = [];

    areas.forEach((area) => {
      result.push({
        id: area.id,
        nombre: `${"— ".repeat(level)}${area.nombre}`
      });

      if (area.subAreas?.length > 0) {
        result = result.concat(flattenAreas(area.subAreas, level + 1));
      }
    });

    return result;
  };

  const areasPlanas = useMemo(() => flattenAreas(areas), [areas]);

  // FILTROS
  const reportesFiltrados = useMemo(() => {
    return reportes.filter((r: any) => {
      const coincideArea = !selectedArea || r.areaId === selectedArea;

      const fecha = new Date(r.fechaCreacion);
      const desdeOK = !fechaDesde || fecha >= new Date(fechaDesde);
      const hastaOK = !fechaHasta || fecha <= new Date(fechaHasta);

      return coincideArea && desdeOK && hastaOK;
    });
  }, [selectedArea, fechaDesde, fechaHasta, reportes]);

  // GRAFICO 1: Reclamos por Área
  const reclamosPorArea = useMemo(() => {
    const map = new Map();

    reportesFiltrados.forEach((r: any) => {
      const area = r.areaNombre || "Sin área";
      map.set(area, (map.get(area) || 0) + 1);
    });

    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  // GRAFICO 2: Reclamos por Estado
  const reclamosPorEstado = useMemo(() => {
    const map = new Map();

    reportesFiltrados.forEach((r: any) => {
      const estado = r.estado || "Sin estado";
      map.set(estado, (map.get(estado) || 0) + 1);
    });

    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  // GRAFICO 3: Finalizados por Área
  const finalizadosPorArea = useMemo(() => {
    const map = new Map();

    reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "finaliazado")
      .forEach((r: any) => {
        const area = r.areaNombre || "Sin área";
        map.set(area, (map.get(area) || 0) + 1);
      });

    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  // -------------------------------
  // NUEVOS CÁLCULOS DE GASTOS
  // -------------------------------

  // Total gastos finalizados
  const totalFinalizados = useMemo(() => {
    return reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "finaliazado")
      .reduce((sum, r:any) => sum + (r.costo || 0), 0);
  }, [reportesFiltrados]);

  // Total gastos en cotización
  const totalCotizacion = useMemo(() => {
    return reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "en cotizacion")
      .reduce((sum, r:any) => sum + (r.costo || 0), 0);
  }, [reportesFiltrados]);

  // GRAFICO: Gastos Finalizados
  const gastosFinalizadosData = useMemo(() => {
    const map = new Map();

    reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "finaliazado")
      .forEach((r: any) => {
        const area = r.areaNombre || "Sin área";
        map.set(area, (map.get(area) || 0) + (r.costo || 0));
      });

    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  // GRAFICO: Gastos en cotización
  const gastosCotizacionData = useMemo(() => {
    const map = new Map();

    reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "en cotizacion")
      .forEach((r: any) => {
        const area = r.areaNombre || "Sin área";
        map.set(area, (map.get(area) || 0) + (r.costo || 0));
      });

    return Array.from(map).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  // const exportToPDF = async () => {
  //   if (!pdfRef.current) return;

  //   const canvas = await html2canvas(pdfRef.current, {
  //     scale: 2,
  //     backgroundColor: "#ffffff"
  //   });

  //   const imgData = canvas.toDataURL("image/png");
  //   const pdf = new jsPDF("p", "mm", "a4");

  //   const imgProps = pdf.getImageProperties(imgData);
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //   pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  //   pdf.save("reportes.pdf");
  // };


  const exportToPDF = async () => {
  if (!pdfRef.current) return;
showSpinner?.();
  const canvas = await html2canvas(pdfRef.current, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pdfWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Primera página
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Más páginas
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save("reportes.pdf");
  hideSpinner?.();
};

  return (
    <Box p={3} ref={pdfRef}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Reportes
      </Typography>

      {/* RESUMEN DE GASTOS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Gastos Finalizados</Typography>
            <Typography variant="h5" color="white" fontWeight="bold" >
              ${totalFinalizados.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Gastos en Cotización</Typography>
            <Typography variant="h5" color="secondary" fontWeight="bold">
              ${totalCotizacion.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* FILTROS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Área</InputLabel>
              <Select
                value={selectedArea}
                label="Filtrar por Área"
                onChange={(e) => setSelectedArea(e.target.value as number)}
              >
                <MenuItem value="">Todas</MenuItem>

                {areasPlanas.map((a: any) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />

            <TextField
              label="Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* BOTÓN EXPORTAR */}
      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={exportToPDF}>
          Exportar PDF
        </Button>
      </Box>

      {/* Gráfico Reclamos por Área */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Cantidad de Reclamos por Área
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reclamosPorArea}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value">
                    {reclamosPorArea.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Gráfico torta por estado */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Reclamos por Estado
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reclamosPorEstado}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {reclamosPorEstado.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Gráfico Finalizados por Área */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Reclamos FINALIZADOS por Área
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={finalizadosPorArea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4caf50">
                {finalizadosPorArea.map((_, i) => (
                  <Cell key={i} fill="#4caf50" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO GASTOS FINALIZADOS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            GASTOS en Reclamos FINALIZADOS
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={gastosFinalizadosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1976d2">
                {gastosFinalizadosData.map((_, i) => (
                  <Cell key={i} fill="#1976d2" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRAFICO GASTOS EN COTIZACION */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            GASTOS pendientes (EN COTIZACIÓN)
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={gastosCotizacionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff9800">
                {gastosCotizacionData.map((_, i) => (
                  <Cell key={i} fill="#ff9800" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Lista de Reclamos ({reportesFiltrados.length})
          </Typography>

          {reportesFiltrados.map((r: any) => (
            <Box
              key={r.id}
              p={2}
              mb={1}
              sx={{ border: "1px solid #ddd", borderRadius: "8px" }}
            >
              <Typography>
                <strong>{r.titulo}</strong>
              </Typography>
              <Typography>Área: {r.areaNombre}</Typography>
              <Typography>Estado: {r.estado}</Typography>
              <Typography>
                Costo: ${r.costo ? r.costo.toLocaleString() : 0}
              </Typography>
              <Typography>
                Fecha: {new Date(r.fechaCreacion).toLocaleDateString()}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};
