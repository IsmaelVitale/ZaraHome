// Ficheiro: publication.js

// --- INÍCIO DA LÓGICA DE PUBLICAÇÃO ---

// As constantes de configuração são definidas aqui
const GITHUB_USER = "IsmaelVitale";
const GITHUB_REPO = "ZaraHome";
// ⚠️ Lembre-se de gerar e usar um NOVO token com as permissões corretas
const PAT_TOKEN = "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"; 

const form = document.getElementById('report-generator-form');
const messageContainer = document.getElementById('message-container');
const statusMapping = {
    printer: { 'Okay com ping': 'ok', 'Problema de Rede': 'attention', 'Offline': 'attention' },
    scanner: { 'Okay (sem fio)': 'ok', 'Ausente': 'critical', 'Apenas a base': 'attention', 'Fora do Padrão (com fio)': 'attention', 'Defeituoso': 'critical' },
    decoupler: { 'Luz verde (Okay)': 'ok', 'Luz vermelha (Erro)': 'attention', 'Luz apagada (Inoperante)': 'attention' }
};

function getReportData() {
    const reportDateInput = document.getElementById('report-date').value;
    if (!reportDateInput) {
        messageContainer.textContent = 'ERRO: Por favor, selecione a data do relatório.';
        return null;
    }
    messageContainer.textContent = '';
    const reportSectorInput = document.getElementById('report-sector').value;
    const [year, month, day] = reportDateInput.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const collectedStationData = Array.from(document.querySelectorAll('.station-section')).map(section => {
        const printerText = section.querySelector('select[name="printerStatus"]').value || 'Não preenchido';
        const scannerText = section.querySelector('select[name="scannerStatus"]').value || 'Não preenchido';
        const decouplerText = section.querySelector('select[name="decouplerStatus"]').value || 'Não preenchido';
        const printerStatusKey = statusMapping.printer[printerText] || 'neutral';
        const scannerStatusKey = statusMapping.scanner[scannerText] || 'neutral';
        const decouplerStatusKey = statusMapping.decoupler[decouplerText] || 'neutral';
        let overallStatus = 'ok';
        if (printerStatusKey === 'critical' || scannerStatusKey === 'critical' || decouplerStatusKey === 'critical') overallStatus = 'critical';
        else if (printerStatusKey === 'attention' || scannerStatusKey === 'attention' || decouplerStatusKey === 'attention') overallStatus = 'attention';
        return { id: section.querySelector('input[name="stationId"]').value, serial: section.querySelector('input[name="serial"]').value, printer: { status: printerStatusKey, text: printerText }, scanner: { status: scannerStatusKey, text: scannerText }, decoupler: { status: decouplerStatusKey, text: decouplerText }, obs: section.querySelector('textarea[name="observations"]').value, overall: overallStatus };
    });

    const totalStations = collectedStationData.length;
    const stationsWithOccurrences = collectedStationData.filter(s => s.overall !== 'ok').length;
    const decouplerErrorCount = collectedStationData.filter(s => s.decoupler.status !== 'ok').length;
    const scannerAbsentCount = collectedStationData.filter(s => s.scanner.text.includes('Ausente')).length;
    const decouplerFailureRate = totalStations > 0 ? ((decouplerErrorCount / totalStations) * 100).toFixed(0) : 0;

    return {
        reportInfo: { date: formattedDate, sector: reportSectorInput },
        kpis: { totalStations, stationsWithOccurrences, decouplerFailureRate, scannerAbsentCount },
        stationData: collectedStationData
    };
}

function dateToFileName(day, month) {
    const dias = ["", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte", "vinteum", "vintedois", "vintetres", "vintequatro", "vintecinco", "vinteseis", "vintesete", "vinteoito", "vintenove", "trinta", "trintaeum"];
    const meses = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return `${dias[day]}de${meses[month - 1]}`;
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function generateOfflineHtml(reportData) { /* ... (código para gerar HTML offline, sem alterações) ... */ }


form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const publishBtn = document.getElementById('publish-btn');
    const reportData = getReportData();
    if (!reportData) return;

    publishBtn.disabled = true;
    publishBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Publicando...`;
    messageContainer.textContent = 'A enviar dados para o GitHub... Por favor, aguarde.';
    messageContainer.className = 'mb-4 text-center font-semibold text-blue-600';

    const [day, month] = reportData.reportInfo.date.split('/');
    const reportFileName = `${dateToFileName(parseInt(day), parseInt(month))}.json`;

    const dispatchPayload = {
        event_type: 'add-new-report',
        client_payload: {
            report_date: reportData.reportInfo.date,
            report_filename: reportFileName,
            report_data: JSON.stringify(reportData, null, 2)
        }
    };
    
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${PAT_TOKEN}`
            },
            body: JSON.stringify(dispatchPayload)
        });

        if (response.status === 204) {
            messageContainer.textContent = 'Relatório publicado com sucesso! Pode demorar 1-2 minutos até aparecer no site.';
            messageContainer.className = 'mb-4 text-center font-semibold text-green-600';
        } else {
            const errorData = await response.json();
            throw new Error(`Erro do GitHub: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro na chamada da API do GitHub:', error);
        messageContainer.textContent = `Falha na publicação: ${error.message}`;
        messageContainer.className = 'mb-4 text-center font-semibold text-red-600';
    } finally {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-4 4H4M7 16l-4 4m4-4l4-4m-4 4v-7m0 0l4-4m-4 4H3m4 0h7m0 0l4 4m-4-4l-4 4m4-4V3m0 0l4 4m-4-4l-4 4"></path></svg>Publicar Relatório no Site';
    }
});

document.getElementById('download-offline-btn').addEventListener('click', function() {
    const reportData = getReportData();
    if (!reportData) return;
    
    const [day, month] = reportData.reportInfo.date.split('/');
    const reportFileName = dateToFileName(parseInt(day), parseInt(month));
    const offlineHtml = generateOfflineHtml(reportData);
    downloadFile(offlineHtml, `relatorio_offline_${reportFileName}.html`, 'text/html');
});
