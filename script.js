        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const csvUpload = document.getElementById('csv-upload');
            const groupPerformingInput = document.getElementById('group-performing');
            const titleInput = document.getElementById('title');
            const composerInput = document.getElementById('composer');
            const arrangerInput = document.getElementById('arranger');
            const gradeInput = document.getElementById('grade');
            const filterBtn = document.getElementById('filter-btn');
            const resetBtn = document.getElementById('reset-btn');
            const resultsContainer = document.getElementById('results-container');
            const resultsBody = document.getElementById('results-body');
            const recommendationsContainer = document.getElementById('recommendations-container');
            const recommendationsBody = document.getElementById('recommendations-body');
            const noRecommendationsMsg = document.getElementById('no-recommendations');
            
            // State
            let musicData = [];
            let filteredData = [];
            let selectedPiece = null;
            
            // Event Listeners
            csvUpload.addEventListener('change', handleFileUpload);
            filterBtn.addEventListener('click', applyFilters);
            resetBtn.addEventListener('click', resetFilters);
            
            // Functions
            function handleFileUpload(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                Papa.parse(file, {
                    header: true,
                    complete: function(results) {
                        // Transform the data to match our interface
                        musicData = results.data.map((row, index) => ({
                            code: row.Code || `code-${index}`,
                            eventName: row['Event Name'] || row.Group || '',
                            title: row.Title || '',
                            composer: row.Composer || '',
                            arranger: row.Arranger || '',
                            publisher: row.Publisher || '',
                            grade: parseInt(row.Grade) || 1,
                            specification: row.Specification || ''
                        }));
                        
                        filteredData = [...musicData];
                        renderResults();
                    },
                    error: function(error) {
                        console.error('Error parsing CSV:', error);
                        alert('Error parsing CSV file. Please check the format.');
                    }
                });
            }
            
            function applyFilters() {
                const groupPerforming = groupPerformingInput.value.toLowerCase();
                const title = titleInput.value.toLowerCase();
                const composer = composerInput.value.toLowerCase();
                const arranger = arrangerInput.value.toLowerCase();
                const grade = gradeInput.value ? parseInt(gradeInput.value) : '';
                
                filteredData = [...musicData];
                
                if (groupPerforming) {
                    filteredData = filteredData.filter(piece => 
                        piece.eventName.toLowerCase().includes(groupPerforming)
                    );
                }
                
                if (title) {
                    filteredData = filteredData.filter(piece => 
                        piece.title.toLowerCase().includes(title)
                    );
                }
                
                if (composer) {
                    filteredData = filteredData.filter(piece => 
                        piece.composer.toLowerCase().includes(composer)
                    );
                }
                
                if (arranger) {
                    filteredData = filteredData.filter(piece => 
                        piece.arranger.toLowerCase().includes(arranger)
                    );
                }
                
                if (grade !== '') {
                    filteredData = filteredData.filter(piece => piece.grade === grade);
                }
                
                renderResults();
            }
            
            function resetFilters() {
                groupPerformingInput.value = '';
                titleInput.value = '';
                composerInput.value = '';
                arrangerInput.value = '';
                gradeInput.value = '';
                
                filteredData = [...musicData];
                renderResults();
            }
            
            function renderResults() {
                if (filteredData.length === 0) {
                    resultsContainer.style.display = 'none';
                    return;
                }
                
                resultsContainer.style.display = 'block';
                resultsBody.innerHTML = '';
                
                filteredData.forEach(piece => {
                    const row = document.createElement('tr');
                    
                    // Create checkbox cell
                    const checkboxCell = document.createElement('td');
                    const checkboxContainer = document.createElement('label');
                    checkboxContainer.className = 'checkbox-container';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = selectedPiece === piece.code;
                    checkbox.addEventListener('change', () => handleCheckboxChange(piece.code));
                    
                    const checkmark = document.createElement('span');
                    checkmark.className = 'checkmark';
                    
                    checkboxContainer.appendChild(checkbox);
                    checkboxContainer.appendChild(checkmark);
                    checkboxCell.appendChild(checkboxContainer);
                    
                    row.appendChild(checkboxCell);
                    
                    // Add other cells
                    const fields = ['code', 'eventName', 'title', 'composer', 'arranger', 'publisher', 'grade', 'specification'];
                    fields.forEach(field => {
                        const cell = document.createElement('td');
                        cell.textContent = piece[field];
                        row.appendChild(cell);
                    });
                    
                    resultsBody.appendChild(row);
                });
            }
            
            function handleCheckboxChange(pieceCode) {
                if (selectedPiece === pieceCode) {
                    selectedPiece = null;
                    renderResults();
                    renderRecommendations([]);
                    return;
                }
                
                selectedPiece = pieceCode;
                
                // Find the selected piece
                const piece = musicData.find(p => p.code === pieceCode);
                if (!piece) return;
                
                // Find recommendations based on same event name, arranger, and within one grade
                const recommendations = musicData.filter(p => 
                    p.code !== pieceCode && // Not the same piece
                    p.eventName === piece.eventName && // Same event name
                    (p.arranger === piece.arranger || !piece.arranger) && // Same arranger if exists
                    Math.abs(p.grade - piece.grade) <= 1 // Within one grade
                );
                
                renderResults();
                renderRecommendations(recommendations);
            }
            
            function renderRecommendations(recommendations) {
                if (recommendations.length === 0) {
                    recommendationsContainer.style.display = 'none';
                    noRecommendationsMsg.style.display = 'block';
                    noRecommendationsMsg.textContent = selectedPiece 
                        ? 'No recommendations found for the selected piece.' 
                        : 'Select a piece to see recommendations.';
                    return;
                }
                
                recommendationsContainer.style.display = 'block';
                noRecommendationsMsg.style.display = 'none';
                recommendationsBody.innerHTML = '';
                
                recommendations.forEach(piece => {
                    const row = document.createElement('tr');
                    
                    // Add cells
                    const fields = ['code', 'eventName', 'title', 'composer', 'arranger', 'publisher', 'grade', 'specification'];
                    fields.forEach(field => {
                        const cell = document.createElement('td');
                        cell.textContent = piece[field];
                        row.appendChild(cell);
                    });
                    
                    recommendationsBody.appendChild(row);
                });
            }
        });