// script.js — with HTML formatting for Teams and dynamic attack types

document.addEventListener('DOMContentLoaded', function() {
    
    // Get common elements
    const date = document.getElementById('date');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const configId = document.getElementById('configId');
    const title = document.getElementById('title');
    const finalMessage = document.getElementById('finalMessage');
    const messageOutput = document.getElementById('messageOutput');
    const updateBtn = document.getElementById('updateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const addAttackBtn = document.getElementById('addAttackBtn');
    const attackTypesContainer = document.getElementById('attackTypesContainer');
    const attackCountSpan = document.getElementById('attackCount');
    
    // Store all attack type sections
    let attackSections = [];
    let attackCounter = 1;
    
    // Template for attack type section HTML
    function getAttackSectionHTML(index) {
        return `
            <div class="attack-type-section" data-attack-index="${index}" id="attackSection_${index}">
                <div class="attack-type-header">
                    <span class="attack-type-title">Attack ${index}</span>
                    <button class="remove-attack-btn" onclick="removeAttackSection(${index})">REMOVE</button>
                </div>
                <div class="input-grid">
                    <div class="input-card">
                        <div class="input-label">Config ID</div>
                        <input type="text" class="input-field attack-config" id="attackConfig_${index}" data-index="${index}" placeholder="Config ID" value="${configId.value}">
                    </div>
                    <div class="input-card">
                        <div class="input-label">Hostname(s)</div>
                        <input type="text" class="input-field hostname" id="hostname_${index}" data-index="${index}" placeholder="td.com, example.com" value="td.com">
                    </div>
                    <div class="input-card">
                        <div class="input-label">Deny Traffic</div>
                        <input type="text" class="input-field deny-traffic" id="denyTraffic_${index}" data-index="${index}" placeholder="e.g., 80000" value="80000">
                    </div>
                    <div class="input-card">
                        <div class="input-label">Alert Traffic</div>
                        <input type="text" class="input-field alert-traffic" id="alertTraffic_${index}" data-index="${index}" placeholder="e.g., 20000" value="20000">
                    </div>
                    <div class="input-card">
                        <div class="input-label">Total Traffic</div>
                        <input type="text" class="input-field total-traffic" id="totalTraffic_${index}" data-index="${index}" placeholder="Auto-calculated" readonly style="background-color: #f0f0f0;">
                    </div>
                    <div class="input-card">
                        <div class="input-label">Source IP(s)</div>
                        <input type="text" class="input-field src-ip" id="srcIp_${index}" data-index="${index}" placeholder="xx.xx.xx.xx" value="8.8.8.8">
                    </div>
                    <div class="input-card">
                        <div class="input-label">ASN & Country (per IP)</div>
                        <input type="text" class="input-field asn-country" id="asnCountry_${index}" data-index="${index}" placeholder="[ASN] (Country)" value="[Example] (US)">
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize with one attack type
    function initializeAttackSections() {
        attackTypesContainer.innerHTML = getAttackSectionHTML(1);
        attackSections = [{
            index: 1,
            element: document.getElementById('attackSection_1')
        }];
        updateAttackCount();
        attachInputListeners();
        updateTotalTrafficFields(); // Initialize total traffic fields
    }
    
    // Add new attack section
    window.addAttackSection = function() {
        attackCounter++;
        const newIndex = attackCounter;
        attackTypesContainer.insertAdjacentHTML('beforeend', getAttackSectionHTML(newIndex));
        
        // Set default config ID from common parameter
        const attackConfig = document.getElementById(`attackConfig_${newIndex}`);
        if (attackConfig) {
            attackConfig.value = configId.value;
        }
        
        attackSections.push({
            index: newIndex,
            element: document.getElementById(`attackSection_${newIndex}`)
        });
        
        updateAttackCount();
        attachInputListeners();
        updateTotalTrafficFields(); // Update total traffic for new section
        updateDisplay(); // Update preview with new section
    };
    
    // Remove attack section
    window.removeAttackSection = function(index) {
        const sectionToRemove = document.getElementById(`attackSection_${index}`);
        if (sectionToRemove && attackSections.length > 1) { // Keep at least one section
            sectionToRemove.remove();
            attackSections = attackSections.filter(s => s.index !== index);
            updateAttackCount();
            updateDisplay(); // Update preview after removal
        } else if (attackSections.length <= 1) {
            alert("At least one attack type is required!");
        }
    };
    
    // Update attack count display
    function updateAttackCount() {
        attackCountSpan.textContent = `(${attackSections.length})`;
    }
    
    // Update total traffic fields based on deny + alert
    function updateTotalTrafficFields() {
        attackSections.forEach(section => {
            const index = section.index;
            const denyInput = document.getElementById(`denyTraffic_${index}`);
            const alertInput = document.getElementById(`alertTraffic_${index}`);
            const totalInput = document.getElementById(`totalTraffic_${index}`);
            
            if (denyInput && alertInput && totalInput) {
                const denyValue = parseInt(denyInput.value.replace(/,/g, '')) || 0;
                const alertValue = parseInt(alertInput.value.replace(/,/g, '')) || 0;
                const totalValue = denyValue + alertValue;
                totalInput.value = totalValue.toLocaleString();
            }
        });
    }
    
    // Format IPs with ASN/country for a specific attack section
    function formatIpList(srcIpElement, asnElement) {
        const ips = srcIpElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');
        const asnList = asnElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');

        let ipBullets = '';
        let ipHtmlList = '';
        
        if (ips.length > 0) {
            ipBullets = ips.map((ip, index) => {
                if (index < asnList.length) {
                    return `• <em>${ip}</em> ${asnList[index]}`;
                } else {
                    return `• <em>${ip}</em>`;
                }
            }).join('<br>');
            
            ipHtmlList = ips.map((ip, index) => {
                if (index < asnList.length) {
                    return `  <li><em>${ip}</em> ${asnList[index]}</li>`;
                } else {
                    return `  <li><em>${ip}</em></li>`;
                }
            }).join('\n');
        } else {
            ipBullets = '• <em>xx.xx.xx.xx</em>';
            ipHtmlList = '  <li><em>xx.xx.xx.xx</em></li>';
        }
        
        return { ipBullets, ipHtmlList };
    }
    
    // Format hostnames as bullet points for a specific attack
    function formatHostnameList(hostnameElement) {
        const hostnames = hostnameElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');
        let hostnameBullets = '';
        let hostnameHtmlList = '';
        
        if (hostnames.length > 0) {
            hostnameBullets = hostnames.map(h => `• <em>${h}</em>`).join('<br>');
            hostnameHtmlList = hostnames.map(h => `  <li><em>${h}</em></li>`).join('\n');
        } else {
            hostnameBullets = '• <em>xxxxx.com</em>';
            hostnameHtmlList = '  <li><em>xxxxx.com</em></li>';
        }
        
        return { hostnameBullets, hostnameHtmlList };
    }
    
    // Show generation notification
    function showGeneratedNotification() {
        const originalText = updateBtn.textContent;
        updateBtn.textContent = '✓ GENERATED!';
        setTimeout(() => {
            updateBtn.textContent = 'GENERATE';
        }, 1500);
    }
    
    // Collect all attack data from sections
    function collectAttackData() {
        const attacks = [];
        
        attackSections.forEach(section => {
            const index = section.index;
            const attackConfigEl = document.getElementById(`attackConfig_${index}`);
            const hostnameEl = document.getElementById(`hostname_${index}`);
            const denyTrafficEl = document.getElementById(`denyTraffic_${index}`);
            const alertTrafficEl = document.getElementById(`alertTraffic_${index}`);
            const totalTrafficEl = document.getElementById(`totalTraffic_${index}`);
            const srcIpEl = document.getElementById(`srcIp_${index}`);
            const asnCountryEl = document.getElementById(`asnCountry_${index}`);
            
            if (attackConfigEl && hostnameEl && denyTrafficEl && alertTrafficEl && totalTrafficEl && srcIpEl && asnCountryEl) {
                attacks.push({
                    index,
                    attackConfig: attackConfigEl,
                    hostname: hostnameEl,
                    denyTraffic: denyTrafficEl,
                    alertTraffic: alertTrafficEl,
                    totalTraffic: totalTrafficEl,
                    srcIp: srcIpEl,
                    asnCountry: asnCountryEl
                });
            }
        });
        
        return attacks;
    }
    
    // Build the message
    function buildMessage() {
        const attacks = collectAttackData();
        
        // Initialize totals
        let totalDenyAll = 0;
        let totalAlertAll = 0;
        let totalTrafficAll = 0;
        
        // Format date and time range
        const dateTimeRange = `${date.value || '01 Jan 2024'} from <strong>${startTime.value || 'xx:xx'}</strong> to <strong>${endTime.value || 'xx:xx'}</strong>`;
        
        // Title mapping
        function getTitleDisplay(titleValue) {
            const titleMap = {
                'traffic spike': 'traffic spike',
                'preliminary spike': 'preliminary spike',
                'morning spike': 'morning spike',
                'evening spike': 'evening spike'
            };
            return titleMap[titleValue] || 'traffic spike';
        }
        
        // Build display message parts
        let displayAttacksPart = '';
        let teamsAttacksPart = '';
        
        attacks.forEach((attack, idx) => {
            const { ipBullets, ipHtmlList } = formatIpList(attack.srcIp, attack.asnCountry);
            const { hostnameBullets, hostnameHtmlList } = formatHostnameList(attack.hostname);
            
            // Calculate values for individual attack
            // Remove any commas from input values before parsing
            const denyValue = parseInt(attack.denyTraffic.value.replace(/,/g, '')) || 0;
            const alertValue = parseInt(attack.alertTraffic.value.replace(/,/g, '')) || 0;
            const totalValue = denyValue + alertValue;
            
            // Update the total traffic field (in case it hasn't been updated)
            attack.totalTraffic.value = totalValue.toLocaleString();
            
            // Calculate percentages
            const denyPercent = totalValue > 0 ? ((denyValue / totalValue) * 100).toFixed(1) : '0';
            const alertPercent = totalValue > 0 ? ((alertValue / totalValue) * 100).toFixed(1) : '0';
            
            // Add to overall totals
            totalDenyAll += denyValue;
            totalAlertAll += alertValue;
            totalTrafficAll += totalValue;
            
            // Display version for individual attack
            displayAttacksPart += `
<strong>Attack ${idx + 1}</strong><br>
Config ID: <strong>${attack.attackConfig.value || configId.value || 'xxxx'}</strong><br>
Hostname(s):<br>
${hostnameBullets}<br>
Deny Traffic: <strong>${denyValue.toLocaleString()}</strong><br>
Alert Traffic: <strong>${alertValue.toLocaleString()}</strong><br>
Total Traffic: <strong>${totalValue.toLocaleString()}</strong><br>
Total traffic denied: <strong>${denyPercent}%</strong><br>
Source traffic IP(s):<br>
${ipBullets}<br><br>`;

            // Teams version for individual attack
            teamsAttacksPart += `
<p><strong>Attack ${idx + 1}</strong></p>

<p>Config ID: <strong>${attack.attackConfig.value || configId.value || 'xxxx'}</strong></p>

<p>Hostname(s):</p>
<ul>
${hostnameHtmlList}
</ul>

<p>Deny Traffic: <strong>${denyValue.toLocaleString()}</strong><br>
Alert Traffic: <strong>${alertValue.toLocaleString()}</strong><br>
Total Traffic: <strong>${totalValue.toLocaleString()}</strong><br>
Total traffic denied: <strong>${denyPercent}%</strong></p>

<p>Source traffic IP(s):</p>
<ul>
${ipHtmlList}
</ul>`;
        });
        
        // Calculate overall percentages based on grand total
        const totalDenyPercent = totalTrafficAll > 0 ? ((totalDenyAll / totalTrafficAll) * 100).toFixed(1) : '0';
        const totalAlertPercent = totalTrafficAll > 0 ? ((totalAlertAll / totalTrafficAll) * 100).toFixed(1) : '0';
        
        // Version 1: For web display (with <br> tags) including totals
        const displayMessage = `Hi <strong>All</strong>,<br><br>
CSOC observed ${getTitleDisplay(title.value)} on Akamai on ${dateTimeRange}<br><br>
${displayAttacksPart}
<strong>=== COMBINED TOTALS ===</strong><br>
Total Deny Traffic: <strong>${totalDenyAll.toLocaleString()}</strong> (${totalDenyPercent}% of grand total)<br>
Total Alert Traffic: <strong>${totalAlertAll.toLocaleString()}</strong> (${totalAlertPercent}% of grand total)<br>
<strong>Grand Total Traffic: ${totalTrafficAll.toLocaleString()}</strong><br><br>
${finalMessage.value || 'CSOC will provide detailed reports shortly.'}`;

        // Version 2: For Teams clipboard including totals
        const teamsMessage = `<p>Hi <strong>All</strong>,</p>

<p>CSOC observed ${getTitleDisplay(title.value)} on Akamai on ${date.value || '01 Jan 2024'} from <strong>${startTime.value || 'xx:xx'}</strong> to <strong>${endTime.value || 'xx:xx'}</strong></p>

${teamsAttacksPart}

<p><strong>=== COMBINED TOTALS ===</strong><br>
Total Deny Traffic: <strong>${totalDenyAll.toLocaleString()}</strong> (${totalDenyPercent}% of grand total)<br>
Total Alert Traffic: <strong>${totalAlertAll.toLocaleString()}</strong> (${totalAlertPercent}% of grand total)<br>
<strong>Grand Total Traffic: ${totalTrafficAll.toLocaleString()}</strong></p>

<p>${finalMessage.value || 'CSOC will provide detailed reports shortly.'}</p>`;

        return {
            display: displayMessage,
            teams: teamsMessage
        };
    }
    
    // Update the display
    function updateDisplay() {
        updateTotalTrafficFields(); // Update all total traffic fields first
        const messages = buildMessage();
        messageOutput.innerHTML = messages.display;
        showGeneratedNotification();
    }
    
    // Copy to clipboard
    function copyToClipboard() {
        const messages = buildMessage();
        
        const blob = new Blob([messages.teams], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
            'text/html': blob,
            'text/plain': new Blob([messages.teams.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
        });
        
        navigator.clipboard.write([clipboardItem]).then(() => {
            copyBtn.textContent = '✓ COPIED!';
            setTimeout(() => {
                copyBtn.textContent = '📋 COPY TO CLIPBOARD';
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
    }
    
    // Update attack config IDs when common config ID changes
    function updateAttackConfigIds() {
        const attacks = collectAttackData();
        attacks.forEach(attack => {
            if (attack.attackConfig) {
                attack.attackConfig.value = configId.value;
            }
        });
        updateDisplay();
    }
    
    // Attach input listeners to all dynamic fields
    function attachInputListeners() {
        const attacks = collectAttackData();
        
        attacks.forEach(attack => {
            [attack.attackConfig, attack.hostname, attack.denyTraffic, attack.alertTraffic, attack.srcIp, attack.asnCountry].forEach(el => {
                if (el) {
                    el.removeEventListener('input', updateDisplay);
                    el.addEventListener('input', updateDisplay);
                }
            });
        });
    }
    
    // Add event listeners
    addAttackBtn.addEventListener('click', window.addAttackSection);
    updateBtn.addEventListener('click', updateDisplay);
    copyBtn.addEventListener('click', copyToClipboard);
    
    // Common inputs
    [date, startTime, endTime, configId, title, finalMessage].forEach(input => {
        input.addEventListener('input', updateDisplay);
    });
    
    // Update attack config IDs when common config ID changes
    configId.addEventListener('input', updateAttackConfigIds);
    
    // Initialize with one attack type
    initializeAttackSections();
    
    // Make remove function globally available
    window.removeAttackSection = removeAttackSection;
    
    // Initial update
    updateDisplay();
});