// Asegurarse de que localStorage tenga un arreglo vacío si no hay datos previos
if (!localStorage.getItem('scannedData')) {
    localStorage.setItem('scannedData', JSON.stringify([]));
}

// Variables para controlar el escaneo y el tiempo entre escaneos
let scanningAllowed = false;
const scanInterval = 2000; // 2000 milisegundos = 2 segundos
let lastScanTime = 0;

// Función para inicializar la aplicación
function initializeApp() {
    // Cargar datos almacenados al iniciar la aplicación
    const storedData = JSON.parse(localStorage.getItem('scannedData'));
    if (storedData) {
        updateResultPanel(storedData);
    }

    // Agregar evento al botón de escanear
    document.getElementById('scanButton').addEventListener('click', handleScanButtonClick);

    // Agregar evento al botón de limpiar bitácora
    document.getElementById('clearButton').addEventListener('click', handleClearButtonClick);
}

// Función para manejar el clic en el botón de escanear
function handleScanButtonClick() {
    if (!scanningAllowed) {
        scanningAllowed = true;
        scanQRCode();
    }
}

// Función para escanear el código QR
function scanQRCode() {
    const codeReader = new ZXing.BrowserQRCodeReader();
    codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
        if (result) {
            if (Date.now() - lastScanTime >= scanInterval) {
                handleScanResult(result.text);
                lastScanTime = Date.now();
            }
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err);
        }
        scanningAllowed = false; // Permitir escaneo nuevamente
    });
}

// Función para manejar el clic en el botón de limpiar bitácora
function handleClearButtonClick() {
    localStorage.removeItem('scannedData'); // Limpiar localStorage
    document.getElementById('result').innerHTML = ''; // Limpiar contenido del panel de resultados
}

// Función para manejar el resultado del escaneo
function handleScanResult(scanResult) {
    const timestamp = formatTimestamp(new Date());
    let scannedData = JSON.parse(localStorage.getItem('scannedData')) || [];

    // Obtener el número de secuencia para el mismo código
    const scanCount = scannedData.filter(data => data.content === scanResult).length + 1;

    scannedData.push({ content: scanResult, timestamp, scanCount });
    localStorage.setItem('scannedData', JSON.stringify(scannedData));
    updateResultPanel(scannedData); // Actualizar panel con los nuevos datos
}

// Función para actualizar el panel de resultados
function updateResultPanel(data) {
    const resultContainer = document.getElementById('result');

    // Limpiar contenido anterior
    resultContainer.innerHTML = '';

    // Recorrer los datos y agregar elementos al final
    data.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('result-item');

        const timestampSpan = document.createElement('span');
        timestampSpan.classList.add('timestamp');
        timestampSpan.textContent = `${item.timestamp}`;

        const scanNumberSpan = document.createElement('span');
        scanNumberSpan.classList.add('scan-number');
        scanNumberSpan.textContent = ` (${item.scanCount})`;

        div.appendChild(timestampSpan);
        div.appendChild(scanNumberSpan);
        div.appendChild(document.createTextNode(`: QR Code Registered: `));

        const contentSpan = document.createElement('span');
        contentSpan.textContent = item.content;
        contentSpan.style.color = '#0000FF'; // Color azul para el contenido

        div.appendChild(contentSpan);

        resultContainer.appendChild(div); // Agregar al final
    });

    // Desplazar automáticamente hacia abajo
    resultContainer.scrollTop = resultContainer.scrollHeight;
}

// Función para formatear el timestamp
function formatTimestamp(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().substr(-2);
    const hour = date.getHours() % 12 || 12; // Obtener hora en formato 12 horas
    const period = date.getHours() >= 12 ? 'PM' : 'AM';
    const formattedHour = `${hour}:${date.getMinutes().toString().padStart(2, '0')} ${period}`;

    return `${day} ${month} ${year}, ${formattedHour}`;
}

// Llamar a la función de inicialización cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);
