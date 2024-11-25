const ctx = document.getElementById('gridLoadChart').getContext('2d');
const gridLoadChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Grid Load (kW)',
                data: [],
                borderColor: '#00adb5',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Stable Release (kW)',
                data: [],
                borderColor: '#ff9800',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'Energy Production (kW)',
                data: [],
                borderColor: '#f44336',
                fill: false,
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#333'
                }
            }
        },
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Time (s)',
                    color: '#333'
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: '#333',
                    autoSkip: false
                }
            },
            y: {
                beginAtZero: false,
                min: -10,
                max: 100,
                title: {
                    display: true,
                    text: 'Load / Production (kW)',
                    color: '#333'
                },
                grid: {
                    display: false
                },
                ticks: {
                    color: '#333'
                }
            }
        }
    }
});

let time = 0;
let load = 0;
let energyProduction = 0;
let uncertainEnergyProduction = 0;
const visibleTimeWindow = 50;
let batteryLevel = 50;  // Start with 50% battery level

function applyFluctuation(value) {
    const fluctuation = Math.random() * 6 - 3;
    return Math.max(-10, Math.min(100, value + fluctuation));
}

function simulateEnergyProduction(gridLoad) {
    const fluctuation = Math.random() * 6 - 3;
    return Math.max(0, Math.min(100, gridLoad + fluctuation));
}

function simulateUncertainEnergyProduction() {
    const timeOfDayFactor = Math.sin(time / 100);
    const randomFactor = (Math.random() * 20 - 10);
    return Math.max(0, 50 + timeOfDayFactor * 30 + randomFactor);
}

async function updateGraph() {
    time += 1;

    const sliderValue = parseFloat(document.getElementById('loadSlider').value);
    load = applyFluctuation(sliderValue);

    energyProduction = simulateEnergyProduction(load);
    uncertainEnergyProduction = simulateUncertainEnergyProduction();

    const stableReleaseLine = 50; // Threshold for stable energy release (kW)

    // Determine if energy is charging or discharging based on energy production vs load
    const isDischarging = energyProduction < stableReleaseLine && load > stableReleaseLine;
    const isCharging = energyProduction > stableReleaseLine && load < stableReleaseLine;

    // Update battery level based on charging or discharging
    if (isDischarging && batteryLevel > 0) {
        // Discharge the battery slowly
        batteryLevel -= 0.2;  // Reduce by a smaller amount for smooth discharge
        document.getElementById('batteryCharging').style.height = 0; // No charging animation
    } else if (isCharging && batteryLevel < 100) {
        // Charge the battery slowly
        batteryLevel += 0.2;  // Increase by a smaller amount for smooth charging
        document.getElementById('batteryCharging').style.height = batteryLevel + '%'; // Show charging animation
    }

    // Update the chart with the new data
    gridLoadChart.data.labels.push(time);
    gridLoadChart.data.datasets[0].data.push(load);
    gridLoadChart.data.datasets[1].data.push(energyProduction);
    gridLoadChart.data.datasets[2].data.push(uncertainEnergyProduction);

    if (gridLoadChart.data.labels.length > visibleTimeWindow) {
        gridLoadChart.data.labels.shift();
        gridLoadChart.data.datasets[0].data.shift();
        gridLoadChart.data.datasets[1].data.shift();
        gridLoadChart.data.datasets[2].data.shift();
    }

    document.getElementById('currentLoad').textContent = load.toFixed(2);
    gridLoadChart.update();

    // Update battery level display
    document.getElementById('batteryLevel').style.height = batteryLevel + '%';
}

setInterval(updateGraph, 1000);
