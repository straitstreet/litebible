// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    const isDark = body.dataset.theme === 'dark';
    
    if (isDark) {
        body.removeAttribute('data-theme');
        button.innerHTML = '🌙 Dark';
        localStorage.setItem('theme', 'light');
    } else {
        body.dataset.theme = 'dark';
        button.innerHTML = '☀️ Light';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme on startup
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.dataset.theme = 'dark';
    document.querySelector('.theme-toggle').innerHTML = '☀️ Light';
}

// Load Bible content
fetch('BSB.ultra.json').then(r=>r.json()).then(d=>{
    let h='';
    d.forEach(b=>{
        h+='<div class="book"><div class="book-title">'+b[0]+'</div>';
        b[1].forEach((c,i)=>{
            h+='<div class="chapter"><div class="chapter-number">'+(i+1)+'</div>';
            c.forEach((v,j)=>h+='<div class="verse"><span class="verse-number">'+(j+1)+'</span>'+v+'</div>');
            h+='</div>';
        });
        h+='</div>';
    });
    document.getElementById('bible').innerHTML=h;
});