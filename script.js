// script.js — with HTML formatting for Teams and dynamic attack types

document.addEventListener('DOMContentLoaded', function() {
    
    // Get common elements
    const date = document.getElementById('date');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const title = document.getElementById('title');
    const status = document.getElementById('status');
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
                    <span class="attack-type-title">Input ${index}</span>
                    <button class="remove-attack-btn" onclick="removeAttackSection(${index})">REMOVE</button>
                </div>
                <div class="input-grid">
                    <div class="input-card">
                        <div class="input-label">Config ID</div>
                        <input type="text" class="input-field attack-config" id="attackConfig_${index}" data-index="${index}" placeholder="Config ID" value="xxxx">
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
        updateTotalTrafficFields();
    }
    
    // Add new attack section
    window.addAttackSection = function() {
        attackCounter++;
        const newIndex = attackCounter;
        attackTypesContainer.insertAdjacentHTML('beforeend', getAttackSectionHTML(newIndex));
        
        attackSections.push({
            index: newIndex,
            element: document.getElementById(`attackSection_${newIndex}`)
        });
        
        updateAttackCount();
        attachInputListeners();
        updateTotalTrafficFields();
        updateDisplay();
    };
    
    // Remove attack section
    window.removeAttackSection = function(index) {
        const sectionToRemove = document.getElementById(`attackSection_${index}`);
        if (sectionToRemove && attackSections.length > 1) {
            sectionToRemove.remove();
            attackSections = attackSections.filter(s => s.index !== index);
            updateAttackCount();
            updateDisplay();
        } else if (attackSections.length <= 1) {
            alert("At least one attack input is required");
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
        updateBtn.textContent = '✓ GENERATED';
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
    
    // Title mapping - converts select values to display text
    function getTitleDisplay(titleValue) {
        
        const titleMap = {
            'Adhoc Theia check': 'Adhoc Theia check',
            'CSOC Preliminary Analysis for THEIA Akamai spike': 'CSOC Preliminary Analysis for THEIA Akamai spike',
            '6 AM ET: No spikes observed across all THEIA platforms except for Akamai': '6 AM ET: No spikes observed across all THEIA platforms except for Akamai',
            '11 PM ET: No spikes observed across all THEIA platforms except for Akamai': '11 PM ET: No spikes observed across all THEIA platforms except for Akamai'
        };
        
        // Return mapped value or default
        return titleMap[titleValue];
    }
    
    // Status mapping - converts select values to display text
    function getStatusDisplay(statusValue) {
        
        const statusMap = {
            'ongoing': { first: 'is', second: 'ongoing', full: 'is ongoing' },
            'subsided': { first: 'has', second: 'subsided', full: 'has subsided' }
        };
        
        // Return mapped value or default
        return statusMap[statusValue] || { first: 'is', second: 'ongoing', full: 'is ongoing' };
    }
    
    // Final Message mapping - converts select values to display text
    function getFinalMessageDisplay(finalValue) {
        
        const finalMap = {
            'Preliminary': 'CSOC will provide updates shortly.',
            'Close': 'CSOC will continue to monitor and provide updates if required.'
        };
        
        // Return mapped value or default
        return finalMap[finalValue];
    }
    
    // Build the message
    function buildMessage() {
        const attacks = collectAttackData();
        
        // Initialize totals
        let totalDenyAll = 0;
        let totalTrafficAll = 0;
        
        // Format date and time range
        const dateTimeRange = `${date.value || 'xx/xx'} from <strong>${startTime.value || 'xx:xx'}</strong> to <strong>${endTime.value || 'xx:xx'}</strong>`;
        
        // Get the display text for all dropdowns using mapping functions
        const titleDisplay = getTitleDisplay(title.value);
        const statusDisplay = getStatusDisplay(status.value);
        const finalDisplay = getFinalMessageDisplay(finalMessage.value);
        
        console.log('Title display:', titleDisplay);
        console.log('Status display:', statusDisplay);
        console.log('Final display:', finalDisplay);
        
        // Build display message parts (without Attack X labels)
        let displayAttacksPart = '';
        let teamsAttacksPart = '';
        
        attacks.forEach((attack, idx) => {
            const { ipBullets, ipHtmlList } = formatIpList(attack.srcIp, attack.asnCountry);
            const { hostnameBullets, hostnameHtmlList } = formatHostnameList(attack.hostname);
            
            // Calculate values for individual attack
            const denyValue = parseInt(attack.denyTraffic.value.replace(/,/g, '')) || 0;
            const alertValue = parseInt(attack.alertTraffic.value.replace(/,/g, '')) || 0;
            const totalValue = denyValue + alertValue;
            
            // Update the total traffic field
            attack.totalTraffic.value = totalValue.toLocaleString();
            
            // Calculate percentages
            const denyPercent = totalValue > 0 ? ((denyValue / totalValue) * 100).toFixed(1) : '0';
            
            // Add to overall totals
            totalDenyAll += denyValue;
            totalTrafficAll += totalValue;
            
            // Add a separator between attacks if this isn't the first one
            if (idx > 0) {
                displayAttacksPart += `<br>`;
                teamsAttacksPart += `<br>`;
            }
            
            // Display version for individual attack (without Attack X label)
            displayAttacksPart += `
<strong>Config ID:</strong> ${attack.attackConfig.value || 'xxxx'}<br>
<strong>Hostname(s):</strong><br>
${hostnameBullets}<br>
<strong>Deny Traffic:</strong> ${denyValue.toLocaleString()}
<strong>Alert Traffic:</strong> ${alertValue.toLocaleString()}
<strong>Total Traffic:</strong> ${totalValue.toLocaleString()}
<strong>Total traffic denied:</strong> ${denyPercent}%<br>
<strong>Source traffic IP(s):</strong><br>
${ipBullets}`;

            // Teams version for individual attack (without Attack X label)
            teamsAttacksPart += `
<p><strong>Config ID:</strong> ${attack.attackConfig.value || 'xxxx'}</p>

<p><strong>Hostname(s):</strong></p>
<ul>
${hostnameHtmlList}
</ul>

<p><strong>Deny Traffic:</strong> ${denyValue.toLocaleString()}
<strong>Alert Traffic:</strong> ${alertValue.toLocaleString()}
<strong>Total Traffic:</strong> ${totalValue.toLocaleString()}
<strong>Total traffic denied:</strong> ${denyPercent}%</p>

<p><strong>Source traffic IP(s):</strong></p>
<ul>
${ipHtmlList}
</ul>`;
        });
        
        // Calculate overall percentage for multiple attacks
        let combinedTotalsSection = '';
        let teamsCombinedTotalsSection = '';
        
        // Only show combined totals if there's more than one attack
        if (attacks.length > 1) {
            const totalDenyPercent = totalTrafficAll > 0 ? ((totalDenyAll / totalTrafficAll) * 100).toFixed(1) : '0';
            
            combinedTotalsSection = `
<strong>Consolidated Traffic</strong><br>
<strong>Total Traffic:</strong> ${totalTrafficAll.toLocaleString()}
<strong>Total Deny Traffic:</strong> ${totalDenyAll.toLocaleString()}
<strong>Percentage Denied:</strong> ${totalDenyPercent}%<br>`;
            
            teamsCombinedTotalsSection = `
<p><strong>Consolidated Traffic</strong>
<br>
<strong>Total Traffic:</strong> ${totalTrafficAll.toLocaleString()}
<strong>Total Deny Traffic:</strong> ${totalDenyAll.toLocaleString()}
<strong>Percentage Denied:</strong> ${totalDenyPercent}%</p>
<br>`;
        }
        
        // Version 1: For web display (with <br> tags) - REMOVED resultDisplay
        const displayMessage = `<strong>${titleDisplay}</strong><br>
CSOC observed traffic spike on Akamai on ${dateTimeRange} which ${statusDisplay.first ? `${statusDisplay.first} ` : ''}<strong>${statusDisplay.second}</strong>.
${displayAttacksPart}
${combinedTotalsSection}
Traffic ${statusDisplay.first ? `${statusDisplay.first} ` : ''}<strong>${statusDisplay.second}</strong> and no impact is expected as majority of traffic are denied.<br>
${finalDisplay}`;

        // Version 2: For Teams clipboard - REMOVED resultDisplay
        const teamsMessage = `<p><strong>${titleDisplay}</strong></p>

<p>CSOC observed traffic spike on Akamai on ${date.value || 'xx/xx'} from <strong>${startTime.value || 'xx:xx'}</strong> to <strong>${endTime.value || 'xx:xx'}</strong>.</p><br>
${teamsAttacksPart}
${teamsCombinedTotalsSection}
<p>Traffic ${statusDisplay.first ? `${statusDisplay.first} ` : ''}<strong>${statusDisplay.second}</strong> and no impact is expected as majority of traffic are denied.</p>
<br>
<p>${finalDisplay}</p>`;

        return {
            display: displayMessage,
            teams: teamsMessage
        };
    }
    
    // Update the display
    function updateDisplay() {
        updateTotalTrafficFields();
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
            copyBtn.textContent = '✓ COPIED';
            setTimeout(() => {
                copyBtn.textContent = 'Clipboard';
            }, 2000);
        }).catch(err => {
            console.error('Copy failed:', err);
        });
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
    
    // Common inputs - REMOVED result from the list
    [date, startTime, endTime, title, status, finalMessage].forEach(input => {
        if (input) {
            input.addEventListener('input', updateDisplay);
        }
    });
    
    // Initialize with one attack type
    initializeAttackSections();
    
    // Make remove function globally available
    window.removeAttackSection = removeAttackSection;
    
    // Initial update
    updateDisplay();

});
