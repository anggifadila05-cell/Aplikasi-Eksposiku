document.addEventListener('DOMContentLoaded', function() { 
    const input = document.getElementById('expositionInput'); 
    const analyzeBtn = document.getElementById('analyzeBtn'); 
    const saveBtn = document.getElementById('saveBtn'); 
    const clearBtn = document.getElementById('clearBtn'); 
    const structureOutput = document.getElementById('structureOutput'); 
    const expositionsList = document.getElementById('expositionsList'); 
 
    let currentExposition = { 
        raw: '', 
        tesis: '', 
        argumentasi: [], 
        penegasan: '', 
        date: '' 
    }; 
 
    // Kata kunci untuk deteksi struktur (bisa dikembangkan) 
    const keywordPatterns = { 
        tesis: ['saya percaya', 'menurut saya', 'pendapat saya', 'saya yakin', 'fakta menunjukkan', 'kunci utama'], 
        argumentasi: ['karena', 'oleh karena itu', 'sebab', 'akibat', 'fakta', 'data', 'bukti', 'misalnya', 'contohnya', 'dengan demikian'], 
        penegasan: ['oleh karena itu', 'dengan demikian', 'kesimpulannya', 'jika demikian', 'maka', 'sehingga', 'akhirnya', 'dapat disimpulkan'] 
    }; 
 
    // Fungsi deteksi struktur otomatis 
    function analyzeStructure(text) { 
        if (!text || text.trim() === '') { 
            structureOutput.innerHTML = '<p>Tekan "Analisis Struktur Otomatis" untuk mendeteksi tesis, argumentasi, dan penegasan ulang.</p>'; 
            return; 
        } 
 
        const lowerText = text.toLowerCase(); 
        let tesis = ''; 
        let argumentasi = []; 
        let penegasan = ''; 
 
        // Deteksi tesis (bagian awal atau dengan kata kunci) 
        let tesisStart = 0; 
        let tesisEnd = text.length; 
        for (let keyword of keywordPatterns.tesis) { 
            const index = lowerText.indexOf(keyword); 
            if (index > -1 && index < tesisEnd) { 
                tesisEnd = index; 
            } 
        } 
        tesis = text.substring(0, tesisEnd).trim(); 
        if (tesis.length > 100) tesis = tesis.substring(0, 100) + '...'; // Singkatkan 
 
        // Deteksi penegasan (bagian akhir atau dengan kata kunci) 
        let penegasanStart = text.length; 
        for (let keyword of keywordPatterns.penegasan) { 
            const index = lowerText.lastIndexOf(keyword); 
            if (index > -1 && index > tesisEnd) { 
                penegasanStart = index; 
            } 
        } 
        penegasan = text.substring(penegasanStart).trim(); 
        if (penegasan.length > 100) penegasan = '...' + penegasan.substring(penegasan.length - 100); 
 
        // Deteksi argumentasi (bagian tengah dengan kata kunci) 
        let middleText = text.substring(tesisEnd, penegasanStart); 
        let sentences = middleText.split(/[.!?]+/).filter(s => s.trim()); 
        argumentasi = sentences.filter(sentence => { 
            const lowerSentence = sentence.toLowerCase(); 
            return keywordPatterns.argumentasi.some(kw => lowerSentence.includes(kw)); 
        }); 
 
        // Update currentExposition 
        currentExposition = { 
            raw: text, 
            tesis: tesis, 
            argumentasi: argumentasi, 
            penegasan: penegasan, 
            date: new Date().toLocaleString('id-ID') 
        }; 
 
        // Tampilkan hasil 
        let outputHTML = ` 
            <div style="font-family: monospace; font-size: 0.9em; color: #2c3e50;"> 
                <h4 style="color: #27ae60;">Tesis (Pendapat Utama):</h4> 
                <p style="background: #f0f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px;">${tesis || 'Tidak terdeteksi'}</p> 
                 
                <h4 style="color: #3498db;">Argumentasi (Dukungan):</h4> 
                <div style="background: #f0f8ff; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto; margin-bottom: 15px;"> 
        `; 
        if (argumentasi.length > 0) { 
            argumentasi.forEach((arg, i) => { 
                outputHTML += `<p style="margin: 5px 0; padding-left: 10px; border-left: 2px solid #3498db;">${arg}</p>`; 
            }); 
        } else { 
            outputHTML += `<p style="color: #7f8c8d;">Tidak ada argumentasi terdeteksi. Tambahkan fakta atau contoh.</p>`; 
        } 
        outputHTML += `</div>`; 
 
        outputHTML += ` 
                <h4 style="color: #e67e22;">Penegasan Ulang (Kesimpulan):</h4> 
                <p style="background: #f0f8ff; padding: 10px; border-radius: 5px; margin-bottom: 0;">${penegasan || 'Tidak terdeteksi'}</p> 
            </div> 
        `; 
        structureOutput.innerHTML = outputHTML; 
    } 
 
    // Event listener untuk analisis otomatis saat mengetik 
    input.addEventListener('input', function() { 
        currentExposition.raw = this.value; 
        // Delay analisis untuk performa (1 detik) 
        clearTimeout(window.analysisTimeout); 
        window.analysisTimeout = setTimeout(() => analyzeStructure(this.value), 1000); 
    }); 
 
    // Tombol Analisis 
    analyzeBtn.addEventListener('click', function() { 
        analyzeStructure(input.value); 
    }); 
 
    // Tombol Simpan 
    saveBtn.addEventListener('click', function() { 
        if (!currentExposition.raw || currentExposition.raw.trim() === '') { 
            alert('Tidak ada teks untuk disimpan!'); 
            return; 
        } 
 
        let savedExpositions = JSON.parse(localStorage.getItem('savedExpositions') || '[]'); 
        savedExpositions.unshift(currentExposition); // Tambah di awal 
        localStorage.setItem('savedExpositions', JSON.stringify(savedExpositions)); 
 
        displaySavedExpositions(); 
        alert('Teks eksposisi berhasil disimpan dengan struktur otomatis!'); 
    }); 
 
    // Tombol Bersihkan 
    clearBtn.addEventListener('click', function() { 
        if (confirm('Yakin ingin menghapus semua teks?')) { 
            input.value = ''; 
            structureOutput.innerHTML = '<p>Tekan "Analisis Struktur Otomatis" untuk mendeteksi tesis, argumentasi, dan penegasan ulang.</p>'; 
            currentExposition = { raw: '', tesis: '', argumentasi: [], penegasan: '', date: '' }; 
        } 
    }); 
 
    // Fungsi tampilkan teks tersimpan 
    function displaySavedExpositions() { 
        let savedExpositions = JSON.parse(localStorage.getItem('savedExpositions') || '[]'); 
        expositionsList.innerHTML = ''; 
 
        if (savedExpositions.length === 0) { 
            expositionsList.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Belum ada teks eksposisi yang tersimpan.</p>'; 
            return; 
        } 
 
        savedExpositions.forEach((exp, index) => { 
            let expHTML = ` 
                <div class="exposition-item"> 
                    <div style="display: flex; justify-content: space-between; align-items: center;"> 
                        <h4>Teks ${index + 1} - ${exp.date.substring(0, 10)}</h4> 
                        <div class="actions"> 
                            <button onclick="viewExposition(${index})">👁️ Lihat</button> 
                            <button onclick="deleteExposition(${index})">🗑️ Hapus</button> 
                        </div> 
                    </div> 
                    <div class="content"> 
                        <p><strong>Tesis:</strong> ${exp.tesis || 'Tidak ada'}</p> 
                        <p><strong>Argumentasi:</strong> ${exp.argumentasi.length || 0} paragraf</p> 
                        <p><strong>Penegasan:</strong> ${exp.penegasan || 'Tidak ada'}</p> 
                    </div> 
                </div> 
            `; 
            expositionsList.innerHTML += expHTML; 
        }); 
    } 
 
    // Fungsi lihat teks (bisa dikembangkan) 
    window.viewExposition = function(index) { 
        let savedExpositions = JSON.parse(localStorage.getItem('savedExpositions') || '[]'); 
        if (index >= 0 && index < savedExpositions.length) { 
            const exp = savedExpositions[index]; 
            alert('Teks Eksposisi:\n\n' + exp.raw); 
        } 
    }; 
 
    // Fungsi hapus teks 
    window.deleteExposition = function(index) { 
        let savedExpositions = JSON.parse(localStorage.getItem('savedExpositions') || '[]'); 
        if (confirm('Yakin ingin menghapus teks ini?')) { 
            savedExpositions.splice(index, 1); 
            localStorage.setItem('savedExpositions', JSON.stringify(savedExpositions)); 
            displaySavedExpositions(); 
        } 
    }; 
 
    // Tampilkan teks tersimpan saat halaman dimuat 
    displaySavedExpositions(); 
 
    // Contoh teks otomatis (opsional, bisa dihapus) 
    input.value = 'Pendidikan adalah kunci kemajuan masyarakat. Karena pendidikan memungkinkan individu mengembangkan potensi diri. Fakta menunjukkan bahwa negara dengan akses pendidikan tinggi memiliki ekonomi lebih baik. Oleh karena itu, pemerintah harus meningkatkan anggaran pendidikan.'; 
    analyzeStructure(input.value); 
});
// Keyboard navigation: Tab untuk elemen, Enter untuk submit 
input.addEventListener('keydown', function(e) { 
    if (e.key === 'Tab') { 
        // Hindari focus di luar form jika perlu 
        if (e.shiftKey) { 
            // Shift+Tab: Navigasi mundur 
        } 
    } 
}); 
 
// Umpan balik real-time untuk screen reader 
function announce(message) { 
    const liveRegion = document.createElement('div'); 
    liveRegion.setAttribute('aria-live', 'polite'); 
    liveRegion.setAttribute('aria-atomic', 'true'); 
    liveRegion.style.position = 'absolute'; 
    liveRegion.style.left = '-9999px'; 
    liveRegion.innerHTML = message; 
    document.body.appendChild(liveRegion); 
    setTimeout(() => document.body.removeChild(liveRegion), 1000); 
} 
 
// Di fungsi analyzeStructure: announce('Struktur terdeteksi: Tesis...') 
 
// Hindari animasi berlebih untuk pengguna vestibular 
document.body.style.setProperty('--animation-speed', 'normal');