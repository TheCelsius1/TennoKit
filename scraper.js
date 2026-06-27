const axios = require('axios');
const fs = require('fs');

async function scrapeWiki() {
    try {
        console.log('Iniciando extracción de datos de la Wiki Oficial...');
        const response = await fetch('https://wiki.warframe.com/api.php?action=parse&page=Prime_Resurgence&format=json&prop=wikitext');
        const data = await response.json();
        const wikitext = data.parse.wikitext['*'];

        const framesHistory = {};

        // La wiki oficial separa las rotaciones con |- seguidas de una tabla interna.
        // Dividimos todo el texto por este patrón para aislar cada grupo de rotación.
        const rows = wikitext.split(/\n\|-\n\|\n\{\| class=.wikitable./).slice(1);
        
        rows.forEach((row) => {
            const beforeTabber = row.split('<tabber>')[0];
            const dates = beforeTabber.match(/\d{4}-\d{2}-\d{2}/g) || [];
            
            const wfRegex = /\{\{WF\|(.*?)\}\}/g;
            let names = [];
            let match;
            while ((match = wfRegex.exec(row)) !== null) {
                names.push(match[1].trim());
            }
            // Eliminar duplicados en la misma fila
            names = [...new Set(names)];
            
            if (names.length > 0 && dates.length > 0) {
                const appearancesInThisRow = Math.max(1, Math.floor(dates.length / 2));
                const datesSorted = dates.sort();
                // La fecha final de esta fila
                const maxDateStr = datesSorted[datesSorted.length - 1];
                const maxDate = new Date(maxDateStr);
                
                names.forEach(name => {
                    if (!framesHistory[name]) {
                        framesHistory[name] = { name: name, total_appearances: 0, last_date: new Date(0) };
                    }
                    framesHistory[name].total_appearances += appearancesInThisRow;
                    if (maxDate > framesHistory[name].last_date) {
                        framesHistory[name].last_date = maxDate;
                    }
                });
            }
        });

        // Calcular algoritmo de probabilidad
        const now = new Date();
        const predictions = Object.values(framesHistory).map(frame => {
            const daysAbsent = Math.floor((now - frame.last_date) / (1000 * 60 * 60 * 24));
            
            // Si hace menos de 90 días, cooldown = 0%
            let score = 0;
            if (daysAbsent >= 90) {
                score = daysAbsent * (1 + (1 / frame.total_appearances));
            }
            
            return {
                name: frame.name,
                total_appearances: frame.total_appearances,
                last_date: frame.last_date.toISOString().split('T')[0],
                days_absent: daysAbsent,
                score: parseFloat(score.toFixed(2))
            };
        });

        // Ordenar por score, luego por días ausente, luego alfabéticamente
        predictions.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            if (b.days_absent !== a.days_absent) {
                return b.days_absent - a.days_absent;
            }
            return a.name.localeCompare(b.name);
        });

        // Guardar JSON localmente
        fs.writeFileSync('resurgence_data.json', JSON.stringify({
            updated_at: now.toISOString(),
            data: predictions
        }, null, 2));

        console.log('✅ Datos extraídos y calculados con éxito!');
        console.log(`Se procesaron ${predictions.length} Warframes.`);
        console.log('Top 3 Predicciones:');
        console.log(predictions.slice(0, 3));

    } catch (e) {
        console.error('Error durante el scraping:', e);
    }
}

scrapeWiki();
