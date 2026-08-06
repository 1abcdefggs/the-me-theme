const fs = require('fs');
const file = 'pages/color-guide.js';
let content = fs.readFileSync(file, 'utf8');
const start = content.indexOf('html += renderRow("⚠️ High Contrast (18.0)", highContrast, false);');
const end = content.indexOf('{ name: "ORANGE", steps: ["#FF8000", "#BF6000", "#804000", "#402000"] },');
if(start > -1 && end > -1) {
  const newContent = content.substring(0, start) + `html += renderRow("⚠️ High Contrast (18.0)", highContrast, false);

          html += \`</div>\`;
        });

        html += \`</div>\`;

        resultBox.style.display = "block";
        resultBox.innerHTML = html;
      }

      function toggleManualInput() {
        var box = document.getElementById("manualInputBox");
        var btn = document.getElementById("toggleManualBtn");
        if (box.style.display === "none") {
          box.style.display = "block";
          btn.innerHTML = "❌ Close";
          btn.style.background = "#31313f";
        } else {
          box.style.display = "none";
          btn.innerHTML = "🧮 Specify Manual Value";
          btn.style.background = "#222";
        }
        generateOptimalColor();
      }

      // Scripts from Contrast Checker

      function linHex(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
      function lumHex(h) { var r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255; return 0.2126 * linHex(r) + 0.7152 * linHex(g) + 0.0722 * linHex(b); }
      function cr(a, b) { var l1 = lumHex(a), l2 = lumHex(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return ((hi + 0.05) / (lo + 0.05)).toFixed(2); }
      
      function upd() {
        var bgEl = document.getElementById("bgHex");
        var fgEl = document.getElementById("fgHex");
        if (!bgEl || !fgEl) return;
        var bg = bgEl.value, fg = fgEl.value;
        if (!/^#[0-9a-fA-F]{6}$/.test(bg) || !/^#[0-9a-fA-F]{6}$/.test(fg)) return;
        
        var r = parseFloat(cr(bg, fg));
        
        var previewEl = document.getElementById("preview");
        if (previewEl) { previewEl.style.background = bg; previewEl.style.color = fg; }
        var resultEl = document.getElementById("result");
        if (resultEl) resultEl.textContent = "Contrast: " + r + ":1";
        
        var gradesEl = document.getElementById("grades");
        if (gradesEl) gradesEl.innerHTML = gd(r >= 7, "AAA Normal(>=7)") + gd(r >= 4.5, "AA Normal(>=4.5)") + gd(r >= 4.5, "AAA Large(>=4.5)") + gd(r >= 3, "AA Large(>=3)");
      }
      
      function gd(p, l) { return "<span class=\\"grade " + (p ? "ok" : "ng") + "\\">" + (p ? "OK" : "--") + " " + l + "</span>"; }
      function sync(el, w) { document.getElementById(w + "Hex").value = el.value; upd(); }
      function stx(el, w) { if (/^#[0-9a-fA-F]{6}$/.test(el.value)) { document.getElementById(w).value = el.value; upd(); } }
      // Exact 12 Pure Colors x 4 Shading Steps from the specification
      var P_matrix = [
        { name: "RED", steps: ["#FF0000", "#BF0000", "#800000", "#400000"] },
` + content.substring(end);
  fs.writeFileSync(file, newContent);
  console.log('success');
} else {
  console.log('not found', start, end);
}
