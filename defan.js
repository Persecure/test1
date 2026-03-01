function defangLastDot(input) {
    if (!input) return input;
    
    // Find the last dot in the string
    const lastDotIndex = input.lastIndexOf('.');
    
    if (lastDotIndex !== -1) {
        // Replace the last dot with [.]
        return input.substring(0, lastDotIndex) + '[.]' + input.substring(lastDotIndex + 1);
    }
    
    // If no dot found, return as-is
    return input;
}


---------------

 function formatIpList(srcIpElement, asnElement) {
    const ips = srcIpElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');
    const asnList = asnElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');

    // Defang all IPs (replace last dot with [.])
    const defangedIps = ips.map(ip => defangLastDot(ip));
    
    let ipBullets = '';
    let ipHtmlList = '';
    
    if (defangedIps.length > 0) {
        ipBullets = defangedIps.map((ip, index) => {
            if (index < asnList.length) {
                return `• <em>${ip}</em> ${asnList[index]}`;
            } else {
                return `• <em>${ip}</em>`;
            }
        }).join('<br>');
        
        ipHtmlList = defangedIps.map((ip, index) => {
            if (index < asnList.length) {
                return `  <li><em>${ip}</em> ${asnList[index]}</li>`;
            } else {
                return `  <li><em>${ip}</em></li>`;
            }
        }).join('\n');
    } else {
        ipBullets = '• <em>xx.xx.xx[.]xx</em>';
        ipHtmlList = '  <li><em>xx.xx.xx[.]xx</em></li>';
    }
    
    return { ipBullets, ipHtmlList };
}

======


  function formatHostnameList(hostnameElement) {
    const hostnames = hostnameElement.value.split(/[,\n]+/).map(item => item.trim()).filter(item => item !== '');
    
    // Defang all hostnames (replace last dot with [.])
    const defangedHostnames = hostnames.map(h => defangLastDot(h));
    
    let hostnameBullets = '';
    let hostnameHtmlList = '';
    
    if (defangedHostnames.length > 0) {
        hostnameBullets = defangedHostnames.map(h => `• <em>${h}</em>`).join('<br>');
        hostnameHtmlList = defangedHostnames.map(h => `  <li><em>${h}</em></li>`).join('\n');
    } else {
        hostnameBullets = '• <em>xxxxx[.]com</em>';
        hostnameHtmlList = '  <li><em>xxxxx[.]com</em></li>';
    }
    
    return { hostnameBullets, hostnameHtmlList };
}
