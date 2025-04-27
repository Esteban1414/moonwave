import { useEffect, useState } from "react";
import { Paper, Typography, Skeleton, Box } from "@mui/material";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";

const BarChart = () => {
    const [data, setData] = useState(null);
    const [totals, setTotals] = useState({
        total: 0,
        google: 0,
        facebook: 0,
        pagina: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/charts");
                const json = await res.json();
                
                if (!res.ok) {
                    throw new Error(json.error || "Error al cargar datos");
                }

                if (json.success) {
                    setData(json.data);

                    const googleTotal = 
                        (json.data.google?.oneDay || 0) +
                        (json.data.google?.threeDays || 0) +
                        (json.data.google?.oneWeekPlus || 0);

                    const facebookTotal = 
                        (json.data.facebook?.oneDay || 0) +
                        (json.data.facebook?.threeDays || 0) +
                        (json.data.facebook?.oneWeekPlus || 0);

                    const paginaTotal = 
                        (json.data.pagina?.oneDay || 0) +
                        (json.data.pagina?.threeDays || 0) +
                        (json.data.pagina?.oneWeekPlus || 0);

                    const total = googleTotal + facebookTotal + paginaTotal;

                    setTotals({
                        total,
                        google: googleTotal,
                        facebook: facebookTotal,
                        pagina: paginaTotal,
                    });
                } else {
                    setData(null);
                }
            } catch (err) {
                setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const options = {
        chart: {
            id: "user-stats",
            toolbar: { show: false },
        },
        xaxis: {
            categories: ["1 día", "3 días", "1 semana+"],
        },
        colors: ["#4285F4", "#1877F2", "#34A853"],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                dataLabels: {
                    position: "top",
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: (val, { seriesIndex, dataPointIndex, w }) => {
                const allValues = w.config.series.flatMap((serie) => serie.data);
                const sum = allValues.reduce((acc, num) => acc + num, 0);
        
                const currentValue = w.config.series[seriesIndex].data[dataPointIndex];
        
                // Si el valor actual es 0, no mostrar nada
                if (currentValue === 0 || sum === 0) return "";
        
                const percentage = (currentValue / sum) * 100;
                return `${percentage.toFixed(2)}%`;
            },
            style: {
                fontSize: "12px",
                colors: ["#fff"],
            },
        },
        
        tooltip: {
            enabled: true,
            y: {
                formatter: (val) => `${val} usuarios`,
            },
        },
        legend: { position: "bottom" },
        noData: {
            text: "No hay datos disponibles",
            align: 'center',
            verticalAlign: 'middle',
        },
    };

    const series = data
        ? [
            {
                name: "Google",
                data: [
                    data.google?.oneDay || 0,
                    data.google?.threeDays || 0,
                    data.google?.oneWeekPlus || 0,
                ],
            },
            {
                name: "Facebook",
                data: [
                    data.facebook?.oneDay || 0,
                    data.facebook?.threeDays || 0,
                    data.facebook?.oneWeekPlus || 0,
                ],
            },
            {
                name: "Página",
                data: [
                    data.pagina?.oneDay || 0,
                    data.pagina?.threeDays || 0,
                    data.pagina?.oneWeekPlus || 0,
                ],
            },
        ]
        : [];

    const hasData = series.length > 0 && series.some(s => s.data.some(v => v > 0));

    const getPercentage = (count) => {
        if (totals.total === 0) return "0%";
        return ((count / totals.total) * 100).toFixed(2) + "%";
    };

    return (
        <Paper
            sx={{
                boxShadow: "none !important",
                borderRadius: "12px",
                padding: "15px",
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
            }}
        >
            <Typography variant="h5" gutterBottom>
                Nuevos usuarios registrados
            </Typography>

            {loading ? (
                <Box sx={{ height: 300 }}>
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                </Box>
            ) : error ? (
                <Box 
                    sx={{ 
                        height: 300, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'error.main'
                    }}
                >
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : !hasData ? (
                <Box 
                    sx={{ 
                        height: 300, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'action.hover',
                        borderRadius: 1
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        No ha habido registros recientemente
                    </Typography>
                </Box>
            ) : (
                <>
                    <Chart 
                        options={options} 
                        series={series} 
                        type="bar" 
                        width="100%" 
                        height={300} 
                    />

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography variant="subtitle1">
                            Total usuarios registrados: <strong>{totals.total}</strong>
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                                Google: {totals.google} usuarios ({getPercentage(totals.google)})
                            </Typography>
                            <Typography variant="body2">
                                Facebook: {totals.facebook} usuarios ({getPercentage(totals.facebook)})
                            </Typography>
                            <Typography variant="body2">
                                Página: {totals.pagina} usuarios ({getPercentage(totals.pagina)})
                            </Typography>
                        </Box>
                    </Box>
                </>
            )}

            <Typography variant="subtitle1" sx={{ textAlign: "center", mt: 2 }}>
                <Link to="/admin/usuarios" className="link">
                    Ver Más
                </Link>
            </Typography>
        </Paper>
    );
};

export default BarChart;
