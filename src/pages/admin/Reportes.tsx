

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
  Cell,
  LineChart,
  Line,
  Legend
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

  // -------------------------------
  // MÉTRICAS DE TIEMPO
  // -------------------------------

  // Calcular días entre dos fechas
  const calcularDias = (fechaInicio: string, fechaFin?: string | null) => {
    // Ignorar fechas inválidas o por defecto
    if (!fechaInicio || fechaInicio.startsWith('0001-01-01')) return null;
    if (fechaFin && fechaFin.startsWith('0001-01-01')) fechaFin = null;

    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const diferencia = fin.getTime() - inicio.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    // Retornar null si el resultado es negativo (dato erróneo)
    return dias < 0 ? null : dias;
  };

  // Promedio de tiempo de resolución (reclamos finalizados)
  const promedioResolucion = useMemo(() => {
    const finalizados = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() === "finaliazado" && r.fechaFin
    );

    if (finalizados.length === 0) return 0;

    const diasValidos = finalizados
      .map((r: any) => calcularDias(r.fechaCreacion, r.fechaFin))
      .filter((dias) => dias !== null && dias >= 0);

    if (diasValidos.length === 0) return 0;

    const totalDias = diasValidos.reduce((sum:any, dias) => sum + dias, 0);

    return Math.round(totalDias / diasValidos.length);
  }, [reportesFiltrados]);

  // Reclamos pendientes con más días
  const reclamosPendientesConTiempo = useMemo(() => {
    return reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "pendiente")
      .map((r: any) => ({
        ...r,
        diasPendiente: calcularDias(r.fechaCreacion)
      }))
      .filter((r: any) => r.diasPendiente !== null && r.diasPendiente >= 0)
      .sort((a, b) => b.diasPendiente - a.diasPendiente)
      .slice(0, 10); // Top 10
  }, [reportesFiltrados]);

  // Tiempo promedio por estado
  const tiempoPromedioPorEstado = useMemo(() => {
    const estadosMap = new Map();

    reportesFiltrados.forEach((r: any) => {
      const estado = r.estado || "Sin estado";
      const dias = calcularDias(r.fechaCreacion, r.fechaFin);

      // Ignorar valores nulos o negativos
      if (dias === null || dias < 0) return;

      if (!estadosMap.has(estado)) {
        estadosMap.set(estado, { total: 0, count: 0 });
      }

      const data = estadosMap.get(estado);
      data.total += dias;
      data.count += 1;
    });

    return Array.from(estadosMap).map(([name, data]: [string, any]) => ({
      name,
      promedio: Math.round(data.total / data.count)
    }));
  }, [reportesFiltrados]);

  // Distribución de reclamos por rango de días
  const distribucionPorTiempo = useMemo(() => {
    const rangos = {
      "0-7 días": 0,
      "8-15 días": 0,
      "16-30 días": 0,
      "31-60 días": 0,
      "Más de 60 días": 0
    };

    reportesFiltrados.forEach((r: any) => {
      const dias = calcularDias(r.fechaCreacion, r.fechaFin);

      // Ignorar valores nulos o negativos
      if (dias === null || dias < 0) return;

      if (dias <= 7) rangos["0-7 días"]++;
      else if (dias <= 15) rangos["8-15 días"]++;
      else if (dias <= 30) rangos["16-30 días"]++;
      else if (dias <= 60) rangos["31-60 días"]++;
      else rangos["Más de 60 días"]++;
    });

    return Object.entries(rangos).map(([name, value]) => ({ name, value }));
  }, [reportesFiltrados]);

  // Reclamos más rápidos y más lentos en resolverse
  const extremosResolucion = useMemo(() => {
    const finalizados = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() === "finaliazado" && r.fechaFin
    );

    if (finalizados.length === 0) return { masRapido: null, masLento: null };

    const conDias = finalizados
      .map((r: any) => ({
        ...r,
        diasResolucion: calcularDias(r.fechaCreacion, r.fechaFin)
      }))
      .filter((r: any) => r.diasResolucion !== null && r.diasResolucion >= 0);

    if (conDias.length === 0) return { masRapido: null, masLento: null };

    const masRapido = conDias.reduce((min, r) =>
      r.diasResolucion < min.diasResolucion ? r : min
    );

    const masLento = conDias.reduce((max, r) =>
      r.diasResolucion > max.diasResolucion ? r : max
    );

    return { masRapido, masLento };
  }, [reportesFiltrados]);

  // -------------------------------
  // NUEVAS MÉTRICAS AVANZADAS
  // -------------------------------

  // SLA: Cumplimiento (objetivo: 15 días)
  const SLA_DIAS = 15;
  const metricasSLA = useMemo(() => {
    const finalizados = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() === "finaliazado" && r.fechaFin
    );

    if (finalizados.length === 0) return { dentroSLA: 0, fueraSLA: 0, porcentaje: 0 };

    let dentroSLA = 0;
    let fueraSLA = 0;

    finalizados.forEach((r: any) => {
      const dias = calcularDias(r.fechaCreacion, r.fechaFin);
      if (dias !== null && dias >= 0) {
        if (dias <= SLA_DIAS) dentroSLA++;
        else fueraSLA++;
      }
    });

    const total = dentroSLA + fueraSLA;
    const porcentaje = total > 0 ? Math.round((dentroSLA / total) * 100) : 0;

    return { dentroSLA, fueraSLA, porcentaje };
  }, [reportesFiltrados]);

  // Eficiencia por área (tiempo promedio de resolución)
  const eficienciaPorArea = useMemo(() => {
    const areasMap = new Map();

    reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() === "finaliazado" && r.fechaFin)
      .forEach((r: any) => {
        const area = r.areaNombre || "Sin área";
        const dias = calcularDias(r.fechaCreacion, r.fechaFin);

        if (dias === null || dias < 0) return;

        if (!areasMap.has(area)) {
          areasMap.set(area, { total: 0, count: 0 });
        }

        const data = areasMap.get(area);
        data.total += dias;
        data.count += 1;
      });

    return Array.from(areasMap)
      .map(([name, data]: [string, any]) => ({
        name,
        promedio: Math.round(data.total / data.count),
        cantidad: data.count
      }))
      .sort((a, b) => a.promedio - b.promedio); // Ordenar por más eficiente
  }, [reportesFiltrados]);

  // Tasa de resolución (reclamos finalizados vs totales)
  const tasaResolucion = useMemo(() => {
    const total = reportesFiltrados.length;
    const finalizados = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() === "finaliazado"
    ).length;

    const porcentaje = total > 0 ? Math.round((finalizados / total) * 100) : 0;

    return { finalizados, total, porcentaje };
  }, [reportesFiltrados]);

  // Reclamos próximos a vencer SLA (pendientes con más de 10 días)
  const proximosVencerSLA = useMemo(() => {
    return reportesFiltrados
      .filter((r: any) => r.estado?.toLowerCase() !== "finaliazado")
      .map((r: any) => ({
        ...r,
        diasTranscurridos: calcularDias(r.fechaCreacion),
        diasRestantes: SLA_DIAS - (calcularDias(r.fechaCreacion) || 0)
      }))
      .filter((r: any) => r.diasTranscurridos !== null && r.diasTranscurridos >= 10 && r.diasRestantes < 5)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 5); // Top 5
  }, [reportesFiltrados]);

  // Tendencia mensual (últimos 6 meses)
  const tendenciaMensual = useMemo(() => {
    const meses = new Map();
    const hoy = new Date();

    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      meses.set(key, { creados: 0, finalizados: 0, promedioResolucion: [] });
    }

    reportes.forEach((r: any) => {
      const fechaCreacion = new Date(r.fechaCreacion);
      const keyCreacion = `${fechaCreacion.getFullYear()}-${String(fechaCreacion.getMonth() + 1).padStart(2, '0')}`;

      if (meses.has(keyCreacion)) {
        meses.get(keyCreacion).creados++;
      }

      if (r.estado?.toLowerCase() === "finaliazado" && r.fechaFin) {
        const fechaFin = new Date(r.fechaFin);
        const keyFin = `${fechaFin.getFullYear()}-${String(fechaFin.getMonth() + 1).padStart(2, '0')}`;

        if (meses.has(keyFin)) {
          meses.get(keyFin).finalizados++;
          const dias = calcularDias(r.fechaCreacion, r.fechaFin);
          if (dias !== null && dias >= 0) {
            meses.get(keyFin).promedioResolucion.push(dias);
          }
        }
      }
    });

    return Array.from(meses).map(([mes, data]: [string, any]) => {
      const promedio = data.promedioResolucion.length > 0
        ? Math.round(data.promedioResolucion.reduce((a: number, b: number) => a + b, 0) / data.promedioResolucion.length)
        : 0;

      return {
        mes,
        creados: data.creados,
        finalizados: data.finalizados,
        promedio
      };
    });
  }, [reportes]);

  // Backlog (reclamos abiertos)
  const backlog = useMemo(() => {
    const abiertos = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() !== "finaliazado"
    );

    return {
      total: abiertos.length,
      pendientes: abiertos.filter((r: any) => r.estado?.toLowerCase() === "pendiente").length,
      enProceso: abiertos.filter((r: any) => ["tecnico", "en curso", "en cotizacion"].includes(r.estado?.toLowerCase())).length
    };
  }, [reportesFiltrados]);

  // Velocidad de cierre (últimos 7 y 30 días)
  const velocidadCierre = useMemo(() => {
    const hoy = new Date();
    const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace30dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

    const cerrados7dias = reportes.filter((r: any) => {
      if (r.estado?.toLowerCase() !== "finaliazado" || !r.fechaFin) return false;
      const fechaFin = new Date(r.fechaFin);
      return fechaFin >= hace7dias;
    }).length;

    const cerrados30dias = reportes.filter((r: any) => {
      if (r.estado?.toLowerCase() !== "finaliazado" || !r.fechaFin) return false;
      const fechaFin = new Date(r.fechaFin);
      return fechaFin >= hace30dias;
    }).length;

    return {
      ultimos7dias: cerrados7dias,
      ultimos30dias: cerrados30dias,
      promedioDiario: Math.round(cerrados30dias / 30)
    };
  }, [reportes]);

  // Costo promedio por día de resolución
  const costoPorDia = useMemo(() => {
    const finalizados = reportesFiltrados.filter(
      (r: any) => r.estado?.toLowerCase() === "finaliazado" && r.fechaFin && r.costo > 0
    );

    if (finalizados.length === 0) return 0;

    const totalCostoPorDia = finalizados.reduce((sum, r: any) => {
      const dias = calcularDias(r.fechaCreacion, r.fechaFin);
      if (dias && dias > 0) {
        return sum + (r.costo / dias);
      }
      return sum;
    }, 0);

    return Math.round(totalCostoPorDia / finalizados.length);
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

      {/* RESUMEN DE GASTOS Y TIEMPOS */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Gastos Finalizados</Typography>
            <Typography variant="h5" color="red" fontWeight="bold" >
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

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Promedio de Resolución</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {promedioResolucion} días
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Reclamos finalizados)
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* MÉTRICAS DE EXTREMOS */}
      {extremosResolucion.masRapido && extremosResolucion.masLento && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          <Card sx={{ flex: 1, borderLeft: "4px solid #4caf50" }}>
            <CardContent>
              <Typography variant="h6" color="success.main">
                Resolución Más Rápida
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {extremosResolucion.masRapido.diasResolucion} días
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {extremosResolucion.masRapido.titulo}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, borderLeft: "4px solid #f44336" }}>
            <CardContent>
              <Typography variant="h6" color="error.main">
                Resolución Más Lenta
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {extremosResolucion.masLento.diasResolucion} días
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {extremosResolucion.masLento.titulo}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* NUEVAS MÉTRICAS: SLA, Tasa de Resolución, Backlog, Velocidad */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1, borderLeft: "4px solid #2196f3" }}>
          <CardContent>
            <Typography variant="h6">Cumplimiento SLA</Typography>
            <Typography variant="h4" fontWeight="bold" color={metricasSLA.porcentaje >= 80 ? "success.main" : "error.main"}>
              {metricasSLA.porcentaje}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metricasSLA.dentroSLA} dentro / {metricasSLA.fueraSLA} fuera (objetivo: {SLA_DIAS} días)
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderLeft: "4px solid #9c27b0" }}>
          <CardContent>
            <Typography variant="h6">Tasa de Resolución</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {tasaResolucion.porcentaje}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tasaResolucion.finalizados} de {tasaResolucion.total} reclamos
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderLeft: "4px solid #ff9800" }}>
          <CardContent>
            <Typography variant="h6">Backlog Total</Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              {backlog.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {backlog.pendientes} pendientes / {backlog.enProceso} en proceso
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderLeft: "4px solid #4caf50" }}>
          <CardContent>
            <Typography variant="h6">Velocidad de Cierre</Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {velocidadCierre.promedioDiario}/día
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {velocidadCierre.ultimos7dias} (7d) / {velocidadCierre.ultimos30dias} (30d)
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Costo promedio por día */}
      {costoPorDia > 0 && (
        <Card sx={{ mb: 3, borderLeft: "4px solid #f44336" }}>
          <CardContent>
            <Typography variant="h6">Costo Promedio por Día de Resolución</Typography>
            <Typography variant="h3" fontWeight="bold" color="error">
              ${costoPorDia.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Este es el costo diario promedio mientras un reclamo está en proceso
            </Typography>
          </CardContent>
        </Card>
      )}

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

      {/* GRÁFICO: Tiempo promedio por estado */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Tiempo Promedio por Estado (días)
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={tiempoPromedioPorEstado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="promedio" fill="#9c27b0">
                {tiempoPromedioPorEstado.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO: Distribución por tiempo */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={3}>
        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Distribución de Reclamos por Tiempo
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribucionPorTiempo}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {distribucionPorTiempo.map((_, i) => (
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

      {/* GRÁFICO: Tendencia Mensual */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Tendencia Mensual (Últimos 6 Meses)
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={tendenciaMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="creados" stroke="#2196f3" name="Creados" strokeWidth={2} />
              <Line type="monotone" dataKey="finalizados" stroke="#4caf50" name="Finalizados" strokeWidth={2} />
              <Line type="monotone" dataKey="promedio" stroke="#f44336" name="Promedio Resolución (días)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* GRÁFICO: Eficiencia por Área */}
      {eficienciaPorArea.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Eficiencia por Área (Tiempo Promedio de Resolución)
            </Typography>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={eficienciaPorArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="promedio" fill="#4caf50">
                  {eficienciaPorArea.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.promedio <= SLA_DIAS ? "#4caf50" : entry.promedio <= 30 ? "#ff9800" : "#f44336"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
              Verde: ≤{SLA_DIAS} días | Naranja: ≤30 días | Rojo: &gt;30 días
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* TABLA: Alertas - Reclamos próximos a vencer SLA */}
      {proximosVencerSLA.length > 0 && (
        <Card sx={{ mb: 3, borderLeft: "4px solid #f44336" }}>
          <CardContent>
            <Typography variant="h6" mb={2} color="error.main">
              ⚠️ Alertas: Reclamos Próximos a Vencer SLA
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Título</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Área</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Días Transcurridos</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Días Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosVencerSLA.map((r: any) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: r.diasRestantes < 2 ? "#ffebee" : r.diasRestantes < 4 ? "#fff3e0" : "white"
                      }}
                    >
                      <td style={{ padding: "12px" }}>{r.titulo}</td>
                      <td style={{ padding: "12px" }}>{r.estado}</td>
                      <td style={{ padding: "12px" }}>{r.areaNombre}</td>
                      <td style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>
                        {r.diasTranscurridos}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: r.diasRestantes < 2 ? "#f44336" : r.diasRestantes < 4 ? "#ff9800" : "#666"
                        }}
                      >
                        {r.diasRestantes > 0 ? r.diasRestantes : "VENCIDO"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* TABLA: Reclamos pendientes con más tiempo */}
      {reclamosPendientesConTiempo.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2} color="warning.main">
              Top 10 - Reclamos Pendientes con Más Tiempo
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Título</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Área</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Usuario</th>
                    <th style={{ padding: "12px", textAlign: "center" }}>Días Pendiente</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Fecha Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {reclamosPendientesConTiempo.map((r: any, index) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #eee",
                        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white"
                      }}
                    >
                      <td style={{ padding: "12px" }}>{r.titulo}</td>
                      <td style={{ padding: "12px" }}>{r.areaNombre}</td>
                      <td style={{ padding: "12px" }}>{r.usuarioNombre}</td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: r.diasPendiente > 30 ? "#f44336" : r.diasPendiente > 15 ? "#ff9800" : "#666"
                        }}
                      >
                        {r.diasPendiente} días
                      </td>
                      <td style={{ padding: "12px" }}>
                        {new Date(r.fechaCreacion).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      )}

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
