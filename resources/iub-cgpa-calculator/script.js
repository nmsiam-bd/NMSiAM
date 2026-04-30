
        // Grade mapping object
        const gradePointMap = {
            'A': 4.00,
            'A-': 3.70,
            'B+': 3.30,
            'B': 3.00,
            'B-': 2.70,
            'C+': 2.30,
            'C': 2.00,
            'C-': 1.70,
            'D+': 1.30,
            'D': 1.00,
            'F': 0.00
        };
        
        // Initialize with 3 courses and previous result row when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializePreviousResult();
            initializeCurrentGPA();
            initializeCourses();
            calculateCGPA();
            updateCurrentGPA();
            setupExportFeatures();
            setupModal();
        });
        
        let courseCounter = 3;
        let selectedExportType = null;
        let currentGPA = 0;
        let currentTotalCredits = 0;
        
        // Function to initialize previous result section
        function initializePreviousResult() {
            const tableBody = document.getElementById('previousTableBody');
            tableBody.innerHTML = '';
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="previous-fixed-value">Transcript</td>
                <td>
                    <input type="number" class="previous-input previous-cgpa" 
                           placeholder="0.00" 
                           min="0.0" max="4.0" step="0.01">
                </td>
                <td>
                    <input type="number" class="previous-input previous-credits" 
                           placeholder="0.0" 
                           min="0" step="0.5">
                </td>
            `;

         // Auto-update copyright year
        document.getElementById("copyright-year").textContent = new Date().getFullYear();
            
            // Add event listeners to previous result inputs
            const inputs = row.querySelectorAll('.previous-input');
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    // Remove error class when user starts typing
                    this.classList.remove('error');
                    
                    if (document.getElementById('autoCalculate').checked) {
                        calculateCGPA();
                    }
                });
            });
            
            tableBody.appendChild(row);
        }
        
        // Function to initialize current GPA section
        function initializeCurrentGPA() {
            const tableBody = document.getElementById('currentGpaTableBody');
            tableBody.innerHTML = '';
            
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="current-gpa-fixed-value">Current Courses</td>
                <td class="current-gpa-value" id="currentCgpaValue">0.00</td>
                <td class="current-gpa-value" id="currentTotalCreditsValue">0.0</td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // Function to update current GPA display
        function updateCurrentGPA() {
            const rows = document.querySelectorAll('#coursesTableBody tr');
            let totalCredits = 0;
            let totalGradePoints = 0;
            let validCourses = 0;
            
            // Calculate current courses CGPA
            rows.forEach(row => {
                const creditInput = row.querySelector('.credit');
                const gradeSelect = row.querySelector('.grade-select');
                
                const credit = parseFloat(creditInput.value) || 0;
                const grade = gradeSelect.value;
                const gradePoint = gradePointMap[grade] || 0;
                
                // Only calculate if both fields have values and are valid
                if (creditInput.value.trim() !== '' && grade !== '' && 
                    !isNaN(credit) && credit > 0) {
                    totalCredits += credit;
                    totalGradePoints += credit * gradePoint;
                    validCourses++;
                }
            });
            
            // Calculate current CGPA
            let calculatedGPA = 0;
            if (totalCredits > 0) {
                calculatedGPA = totalGradePoints / totalCredits;
            }
            
            // Update current GPA values
            currentGPA = calculatedGPA;
            currentTotalCredits = totalCredits;
            
            // Update display
            document.getElementById('currentCgpaValue').textContent = calculatedGPA.toFixed(2);
            document.getElementById('currentTotalCreditsValue').textContent = totalCredits.toFixed(1);
            
            // Return values for other calculations
            return { gpa: calculatedGPA, credits: totalCredits };
        }
        
        // Function to create a course row
        function createCourseRow(courseNumber) {
            const row = document.createElement('tr');
            
            // Create select options for grades
            let gradeOptions = '<option value="">Select Grade</option>';
            for (const [grade, point] of Object.entries(gradePointMap)) {
                gradeOptions += `<option value="${grade}">${grade}</option>`;
            }
            
            row.innerHTML = `
                <td>
                    <input type="text" class="course-input course-name" 
                           placeholder="Course ${courseNumber}" 
                           value="Course ${courseNumber}">
                </td>
                <td>
                    <input type="number" class="course-input credit" 
                           placeholder="3" 
                           min="0.5" max="10" step="0.5">
                </td>
                <td>
                    <select class="grade-select grade-select">
                        ${gradeOptions}
                    </select>
                </td>
                <td class="action-cell">
                    <button class="delete-btn" title="Delete Course">
                        <span class="delete-icon">×</span>
                    </button>
                </td>
            `;
            
            // Add event listeners to inputs
            const nameInput = row.querySelector('.course-name');
            const creditInput = row.querySelector('.credit');
            const gradeSelect = row.querySelector('.grade-select');
            
            nameInput.addEventListener('input', function() {
                this.classList.remove('error');
                if (document.getElementById('autoCalculate').checked) {
                    updateCurrentGPA();
                    calculateCGPA();
                }
            });
            
            creditInput.addEventListener('input', function() {
                this.classList.remove('error');
                if (document.getElementById('autoCalculate').checked) {
                    updateCurrentGPA();
                    calculateCGPA();
                }
            });
            
            gradeSelect.addEventListener('change', function() {
                this.classList.remove('error');
                if (document.getElementById('autoCalculate').checked) {
                    updateCurrentGPA();
                    calculateCGPA();
                }
            });
            
            // Add event listener to delete button
            const deleteBtn = row.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                const table = document.getElementById('coursesTableBody');
                if (table.children.length > 1) {
                    row.remove();
                    updateCourseNames();
                    updateCurrentGPA();
                    if (document.getElementById('autoCalculate').checked) {
                        calculateCGPA();
                    }
                } else {
                    alert('You need at least one course. Try resetting instead.');
                }
            });
            
            return row;
        }
        
        // Function to update course names after deletion
        function updateCourseNames() {
            const rows = document.querySelectorAll('#coursesTableBody tr');
            rows.forEach((row, index) => {
                const courseNameInput = row.querySelector('.course-name');
                
                // Only update if it's still a default name
                if (courseNameInput.value.startsWith('Course ')) {
                    courseNameInput.value = `Course ${index + 1}`;
                }
                courseNameInput.placeholder = `Course ${index + 1}`;
            });
            
            // Update course counter
            courseCounter = rows.length;
            document.getElementById('totalCourses').textContent = courseCounter;
        }
        
        // Initialize with 3 default courses
        function initializeCourses() {
            const table = document.getElementById('coursesTableBody');
            table.innerHTML = '';
            
            for (let i = 1; i <= 3; i++) {
                const row = createCourseRow(i);
                table.appendChild(row);
            }
            
            courseCounter = 3;
            document.getElementById('totalCourses').textContent = courseCounter;
        }
        
        // Add Course Button
        document.getElementById('addCourse').addEventListener('click', function() {
            const table = document.getElementById('coursesTableBody');
            courseCounter++;
            const newRow = createCourseRow(courseCounter);
            table.appendChild(newRow);
            
            document.getElementById('totalCourses').textContent = courseCounter;
            
            updateCurrentGPA();
            if (document.getElementById('autoCalculate').checked) {
                calculateCGPA();
            }
        });
        
        // Reset All Button
        document.getElementById('resetAll').addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all courses and previous results? All data will be lost.')) {
                initializePreviousResult();
                initializeCurrentGPA();
                initializeCourses();
                calculateCGPA();
                updateCurrentGPA();
            }
        });
        
        // Calculate Button
        document.getElementById('calculateBtn').addEventListener('click', function() {
            updateCurrentGPA();
            calculateCGPA();
        });
        
        // Auto-calculate checkbox
        document.getElementById('autoCalculate').addEventListener('change', function() {
            if (this.checked) {
                updateCurrentGPA();
                calculateCGPA();
            }
        });
        
        // Main calculation function
        function calculateCGPA() {
            // Get current GPA and credits
            const current = updateCurrentGPA();
            
            // Get previous result values
            const previousCgpaInput = document.querySelector('.previous-cgpa');
            const previousCreditsInput = document.querySelector('.previous-credits');
            
            const previousCgpa = parseFloat(previousCgpaInput.value) || 0;
            const previousCredits = parseFloat(previousCreditsInput.value) || 0;
            
            // Calculate previous total grade points
            const previousTotalGradePoints = previousCgpa * previousCredits;
            
            // Calculate current total grade points
            const currentTotalGradePoints = current.gpa * current.credits;
            
            // Calculate overall CGPA
            let overallCgpa = 0;
            let totalCredits = previousCredits + current.credits;
            
            if (totalCredits > 0) {
                overallCgpa = (previousTotalGradePoints + currentTotalGradePoints) / totalCredits;
            } else if (previousCredits > 0) {
                // Only previous results exist
                overallCgpa = previousCgpa;
                totalCredits = previousCredits;
            } else if (current.credits > 0) {
                // Only current courses exist
                overallCgpa = current.gpa;
                totalCredits = current.credits;
            }
            
            // Calculate percentage
            const percentage = (overallCgpa / 4.0) * 100;
            
            // Update UI
            document.getElementById('cgpaValue').textContent = overallCgpa.toFixed(2);
            document.getElementById('percentageValue').textContent = percentage.toFixed(0) + '%';
            document.getElementById('totalCredits').textContent = totalCredits.toFixed(1);
            document.getElementById('totalGradePoints').textContent = (previousTotalGradePoints + currentTotalGradePoints).toFixed(2);
            
            // Color indication for incomplete data
            if (current.credits === 0) {
                document.getElementById('cgpaValue').style.color = '#e74c3c';
                document.getElementById('percentageValue').style.color = '#e74c3c';
            } else {
                document.getElementById('cgpaValue').style.color = '#2c3e50';
                document.getElementById('percentageValue').style.color = '#27ae60';
            }
            
            // Update course count
            const rows = document.querySelectorAll('#coursesTableBody tr');
            document.getElementById('totalCourses').textContent = rows.length;
        }
        
        // Setup modal functionality
        function setupModal() {
            const modal = document.getElementById('studentInfoModal');
            const cancelBtn = document.getElementById('cancelBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const form = document.getElementById('studentInfoForm');
            const modalCloseBtn = document.getElementById('modalCloseBtn');
            
            // Modal download buttons
            document.getElementById('modalDownloadPDF').addEventListener('click', function() {
                selectedExportType = 'pdf';
                highlightSelectedButton(this);
                validateAndSubmit();
            });
            
            document.getElementById('modalDownloadCSV').addEventListener('click', function() {
                selectedExportType = 'csv';
                highlightSelectedButton(this);
                validateAndSubmit();
            });
            
            document.getElementById('modalDownloadText').addEventListener('click', function() {
                selectedExportType = 'text';
                highlightSelectedButton(this);
                validateAndSubmit();
            });
            
            document.getElementById('modalDownloadPrint').addEventListener('click', function() {
                selectedExportType = 'print';
                highlightSelectedButton(this);
                validateAndSubmit();
            });
            
            // Cancel button
            cancelBtn.addEventListener('click', function() {
                closeModal();
            });
            
            // Close button for mobile
            modalCloseBtn.addEventListener('click', function() {
                closeModal();
            });
            
            // Download button
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!selectedExportType) {
                    alert('Please select a download format first.');
                    return;
                }
                validateAndSubmit();
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Close modal function
            function closeModal() {
                modal.classList.remove('show');
                selectedExportType = null;
                resetButtonHighlights();
            }
            
            // Highlight selected button
            function highlightSelectedButton(button) {
                // Remove active class from all buttons
                document.querySelectorAll('.download-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to selected button
                button.classList.add('active');
            }
            
            // Reset button highlights
            function resetButtonHighlights() {
                document.querySelectorAll('.download-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
            
            // Validate and submit form
            function validateAndSubmit() {
                // Get student information (no validation required)
                const studentInfo = {
                    name: document.getElementById('studentName').value.trim(),
                    studentId: document.getElementById('studentId').value.trim(),
                    semester: document.getElementById('semester').value.trim(),
                    academicYear: document.getElementById('academicYear').value.trim(),
                    department: document.getElementById('department').value.trim(),
                    email: document.getElementById('email').value.trim()
                };
                
                // Perform the selected export
                switch(selectedExportType) {
                    case 'pdf':
                        exportToPDF(studentInfo);
                        break;
                    case 'csv':
                        exportToCSV(studentInfo);
                        break;
                    case 'text':
                        exportToText(studentInfo);
                        break;
                    case 'print':
                        printResult(studentInfo);
                        break;
                }
                
                // Close modal and reset
                closeModal();
                
                // Optional: Save to local storage for future use
                saveStudentInfo(studentInfo);
            }
        }
        
        // Save student info to localStorage for future use
        function saveStudentInfo(studentInfo) {
            localStorage.setItem('cgpaCalculatorStudentInfo', JSON.stringify(studentInfo));
        }
        
        // Load saved student info
        function loadStudentInfo() {
            const saved = localStorage.getItem('cgpaCalculatorStudentInfo');
            if (saved) {
                try {
                    const studentInfo = JSON.parse(saved);
                    document.getElementById('studentName').value = studentInfo.name || '';
                    document.getElementById('studentId').value = studentInfo.studentId || '';
                    document.getElementById('semester').value = studentInfo.semester || '';
                    document.getElementById('academicYear').value = studentInfo.academicYear || '';
                    document.getElementById('department').value = studentInfo.department || '';
                    document.getElementById('email').value = studentInfo.email || '';
                } catch (e) {
                    console.error('Error loading saved student info:', e);
                }
            }
        }
        
        // Setup export features
        function setupExportFeatures() {
            const exportBtn = document.getElementById('exportBtn');
            const exportMenu = document.getElementById('exportMenu');
            
            // Toggle export menu
            exportBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                exportMenu.classList.toggle('show');
            });
            
            // Close export menu when clicking outside
            document.addEventListener('click', function() {
                exportMenu.classList.remove('show');
            });
            
            // Prevent menu from closing when clicking inside it
            exportMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // Setup export options to show modal
            document.getElementById('exportPDF').addEventListener('click', function() {
                exportMenu.classList.remove('show');
                showStudentInfoModal('pdf');
            });
            
            document.getElementById('exportCSV').addEventListener('click', function() {
                exportMenu.classList.remove('show');
                showStudentInfoModal('csv');
            });
            
            document.getElementById('exportText').addEventListener('click', function() {
                exportMenu.classList.remove('show');
                showStudentInfoModal('text');
            });
            
            document.getElementById('exportPrint').addEventListener('click', function() {
                exportMenu.classList.remove('show');
                showStudentInfoModal('print');
            });
        }
        
        // Show student info modal
        function showStudentInfoModal(exportType) {
            const modal = document.getElementById('studentInfoModal');
            selectedExportType = exportType;
            
            // Load saved student info
            loadStudentInfo();
            
            // Highlight the selected export type
            const buttons = document.querySelectorAll('.download-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            
            switch(exportType) {
                case 'pdf':
                    document.getElementById('modalDownloadPDF').classList.add('active');
                    break;
                case 'csv':
                    document.getElementById('modalDownloadCSV').classList.add('active');
                    break;
                case 'text':
                    document.getElementById('modalDownloadText').classList.add('active');
                    break;
                case 'print':
                    document.getElementById('modalDownloadPrint').classList.add('active');
                    break;
            }
            
            modal.classList.add('show');
        }
        
        // Function to get all data for export
        function getResultData(studentInfo = {}) {
            const cgpaValue = document.getElementById('cgpaValue').textContent;
            const percentageValue = document.getElementById('percentageValue').textContent;
            const totalCourses = document.getElementById('totalCourses').textContent;
            const totalCredits = document.getElementById('totalCredits').textContent;
            const totalGradePoints = document.getElementById('totalGradePoints').textContent;
            
            // Get previous result data
            const previousCgpaInput = document.querySelector('.previous-cgpa');
            const previousCreditsInput = document.querySelector('.previous-credits');
            const previousCgpa = previousCgpaInput.value || '0.00';
            const previousCredits = previousCreditsInput.value || '0.0';
            
            // Get current GPA data
            const currentCgpa = document.getElementById('currentCgpaValue').textContent;
            const currentTotalCredits = document.getElementById('currentTotalCreditsValue').textContent;
            
            // Get current courses data
            const courses = [];
            const rows = document.querySelectorAll('#coursesTableBody tr');
            rows.forEach((row, index) => {
                const courseName = row.querySelector('.course-name').value;
                const creditInput = row.querySelector('.credit');
                const gradeSelect = row.querySelector('.grade-select');
                
                // Get credit value - if empty or invalid, show N/A
                const creditValue = creditInput.value.trim();
                const credit = creditValue === '' ? 'N/A' : (isNaN(parseFloat(creditValue)) ? 'N/A' : creditValue);
                
                // Get grade value - if not selected, show Not Selected
                const grade = gradeSelect.value;
                const gradeDisplay = grade === '' ? 'Not Selected' : grade;
                
                // Get grade point based on selected grade
                const gradePoint = grade === '' ? 'N/A' : gradePointMap[grade].toFixed(2);
                
                courses.push({
                    name: courseName || `Course ${index + 1}`,
                    credit: credit,
                    grade: gradeDisplay,
                    gradePoint: gradePoint
                });
            });
            
            // Calculate date and time
            const now = new Date();
            const dateStr = now.toLocaleDateString();
            const timeStr = now.toLocaleTimeString();
            const timestamp = now.getTime();
            
            return {
                cgpa: cgpaValue,
                percentage: percentageValue,
                totalCourses,
                totalCredits,
                totalGradePoints,
                previousCgpa,
                previousCredits,
                currentCgpa,
                currentTotalCredits,
                courses,
                studentInfo,
                date: dateStr,
                time: timeStr,
                timestamp: timestamp
            };
        }
        
        // Helper function to generate filename
        function generateFileName(studentInfo, data) {
            const name = studentInfo.name ? studentInfo.name.replace(/\s+/g, '_') : '';
            const id = studentInfo.studentId ? studentInfo.studentId.replace(/\s+/g, '_') : '';
            const dateStr = new Date(data.timestamp).toISOString().split('T')[0];
            
            if (name && id) {
                return `IUB_CGPA_Result_${name}_${id}_${dateStr}`;
            } else if (name) {
                return `IUB_CGPA_Result_${name}_${dateStr}`;
            } else if (id) {
                return `IUB_CGPA_Result_${id}_${dateStr}`;
            } else {
                return `IUB_CGPA_Result_${dateStr}`;
            }
        }
        
        // Export to PDF function with consistent footer on every page
        function exportToPDF(studentInfo) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const data = getResultData(studentInfo);
            const margin = 15;
            let yPos = margin;
            
            // Main Title
            doc.setFontSize(22);
            doc.setTextColor(44, 62, 80);
            doc.text("CGPA Result", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
            yPos += 12;
            
            // University Name - Always Independent University, Bangladesh
            doc.setFontSize(14);
            doc.setTextColor(75, 108, 183);
            doc.text("Independent University, Bangladesh (IUB)", doc.internal.pageSize.width / 2, yPos, { align: 'center' });
            yPos += 15;
            
            // Date and time
            doc.setFontSize(10);
            doc.setTextColor(127, 140, 141);
            doc.text(`Generated on: ${data.date} at ${data.time}`, margin, yPos);
            yPos += 10;
            
            // Student Information Section with Heading
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text("Student Information", margin, yPos);
            yPos += 10;
            
            // Student Information in table format
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            
            // Create student info table data
            const studentInfoData = [
                [`Name: ${data.studentInfo.name || 'N/A'}`, `Student ID: ${data.studentInfo.studentId || 'N/A'}`],
                [`Semester: ${data.studentInfo.semester || 'N/A'}`, `Department: ${data.studentInfo.department || 'N/A'}`],
                [`Academic Year: ${data.studentInfo.academicYear || 'N/A'}`, `Email: ${data.studentInfo.email || 'N/A'}`]
            ];
            
            studentInfoData.forEach(row => {
                doc.text(row[0], margin, yPos);
                doc.text(row[1], margin + 100, yPos);
                yPos += 7;
            });
            
            yPos += 10;
            
            // Summary section
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text("Summary", margin, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            
            const summaryData = [
                [`Overall CGPA: ${data.cgpa}`, `Percentage: ${data.percentage}`],
                [`Add Courses: ${data.totalCourses}`, `Total Credits: ${data.totalCredits}`],
                [`Previous CGPA: ${data.previousCgpa}`, `Previous Credits: ${data.previousCredits}`],
                [`Current CGPA: ${data.currentCgpa}`, `Current Credits: ${data.currentTotalCredits}`]
            ];
            
            summaryData.forEach(row => {
                doc.text(row[0], margin, yPos);
                doc.text(row[1], margin + 100, yPos);
                yPos += 8;
            });
            
            yPos += 10;
            
            // Total Grade Points
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Grade Points: ${data.totalGradePoints}`, margin, yPos);
            yPos += 15;
            
            // Courses table
            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text("Courses Details", margin, yPos);
            yPos += 10;
            
            // Prepare table data
            const tableData = data.courses.map(course => [
                course.name,
                course.credit,
                course.grade,
                course.gradePoint
            ]);
            
            // Create autoTable first to get page count
            const tableConfig = {
                startY: yPos,
                head: [['Course Name', 'Credit', 'Grade', 'Grade Point']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [75, 108, 183] },
                margin: { left: margin, right: margin },
                didDrawPage: function(data) {
                    // We'll add footer later
                },
                willDrawCell: function(data) {
                    // Nothing to do here
                }
            };
            
            // Create table
            doc.autoTable(tableConfig);
            
            // Get total pages after table is created
            const totalPages = doc.internal.getNumberOfPages();
            
            // Now add footer to every page
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                
                // Add generator info at the bottom center
                doc.setFontSize(9);
                doc.setTextColor(127, 140, 141);
                const generatorText = "Generated by: IUB CGPA Calculator - N M SiAM, Developed by Noor Mohammad Siam";
                doc.text(generatorText, pageWidth / 2, pageHeight - 15, { align: 'center' });
                
                // Add page number in "Page X of Y" format
                doc.setFontSize(10);
                const pageNumberText = `Page ${i} of ${totalPages}`;
                doc.text(pageNumberText, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
            
            // Go back to last page
            doc.setPage(totalPages);
            
            // Get final Y position after table
            yPos = doc.lastAutoTable.finalY + 20;
            
            // Check if we need to add a new page for the note
            const pageHeight = doc.internal.pageSize.height;
            if (yPos > pageHeight - 40) {
                doc.addPage();
                const newPageNumber = totalPages + 1;
                
                // Add footer to new page
                const pageWidth = doc.internal.pageSize.width;
                const newPageHeight = doc.internal.pageSize.height;
                
                doc.setFontSize(9);
                doc.setTextColor(127, 140, 141);
                const generatorText = "Generated by: IUB CGPA Calculator - N M SiAM, Developed by Noor Mohammad Siam";
                doc.text(generatorText, pageWidth / 2, newPageHeight - 15, { align: 'center' });
                
                doc.setFontSize(10);
                const pageNumberText = `Page ${newPageNumber} of ${newPageNumber}`;
                doc.text(pageNumberText, pageWidth / 2, newPageHeight - 10, { align: 'center' });
                
                yPos = margin;
            }
            
            // Add the red note only on the last page
            doc.setFontSize(10);
            doc.setTextColor(231, 76, 60); // Red color for the note
            const noteText = "Note: This is an unofficial result. Refer to your official transcript for official CGPA.";
            doc.text(noteText, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
            yPos += 7;
            
            // Add Powered by text after the note (only on last page)
            doc.setFontSize(9);
            doc.setTextColor(127, 140, 141);
            const poweredByText = "Powered by - N M SiAM";
            doc.text(poweredByText, doc.internal.pageSize.width / 2, yPos, { align: 'center' });
            
            // Save PDF with custom filename
            const fileName = generateFileName(studentInfo, data) + '.pdf';
            doc.save(fileName);
        }
        
        // Export to CSV function
        function exportToCSV(studentInfo) {
            const data = getResultData(studentInfo);
            
            let csvContent = "CGPA Result\n";
            csvContent += "Independent University, Bangladesh (IUB)\n\n";
            csvContent += "Student Information\n";
            csvContent += `Name,${data.studentInfo.name || 'N/A'}\n`;
            csvContent += `Student ID,${data.studentInfo.studentId || 'N/A'}\n`;
            csvContent += `Semester,${data.studentInfo.semester || 'N/A'}\n`;
            csvContent += `Department,${data.studentInfo.department || 'N/A'}\n`;
            csvContent += `Academic Year,${data.studentInfo.academicYear || 'N/A'}\n`;
            csvContent += `Email,${data.studentInfo.email || 'N/A'}\n`;
            csvContent += `Generated on,${data.date} at ${data.time}\n\n`;
            csvContent += "Summary\n";
            csvContent += `Overall CGPA,${data.cgpa}\n`;
            csvContent += `Percentage,${data.percentage}\n`;
            csvContent += `Add Courses,${data.totalCourses}\n`;
            csvContent += `Total Credits,${data.totalCredits}\n`;
            csvContent += `Total Grade Points,${data.totalGradePoints}\n`;
            csvContent += `Previous CGPA,${data.previousCgpa}\n`;
            csvContent += `Previous Credits,${data.previousCredits}\n`;
            csvContent += `Current CGPA,${data.currentCgpa}\n`;
            csvContent += `Current Credits,${data.currentTotalCredits}\n\n`;
            csvContent += "Courses\n";
            csvContent += "Course Name,Credit,Grade,Grade Point\n";
            
            data.courses.forEach(course => {
                csvContent += `${course.name},${course.credit},${course.grade},${course.gradePoint}\n`;
            });
            
            // Add footer section
            csvContent += "\n";
            csvContent += "Note: This is an unofficial result. Refer to your official transcript for official CGPA.\n";
            csvContent += "Generated by: IUB CGPA Calculator - N M SiAM, Developed by Noor Mohammad Siam\n";
            csvContent += "Powered by - N M SiAM\n";
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = generateFileName(studentInfo, data) + '.csv';
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        
        // Export to Text function
        function exportToText(studentInfo) {
            const data = getResultData(studentInfo);
            
            let textContent = "=".repeat(60) + "\n";
            textContent += "CGPA RESULT\n";
            textContent += "Independent University, Bangladesh (IUB)\n";
            textContent += "=".repeat(60) + "\n\n";
            textContent += "STUDENT INFORMATION\n";
            textContent += "-".repeat(40) + "\n";
            textContent += `Name: ${data.studentInfo.name || 'N/A'}\n`;
            textContent += `Student ID: ${data.studentInfo.studentId || 'N/A'}\n`;
            textContent += `Semester: ${data.studentInfo.semester || 'N/A'}\n`;
            textContent += `Department: ${data.studentInfo.department || 'N/A'}\n`;
            textContent += `Academic Year: ${data.studentInfo.academicYear || 'N/A'}\n`;
            textContent += `Email: ${data.studentInfo.email || 'N/A'}\n`;
            textContent += `Generated on: ${data.date} at ${data.time}\n\n`;
            textContent += "SUMMARY\n";
            textContent += "-".repeat(40) + "\n";
            textContent += `Overall CGPA: ${data.cgpa}\n`;
            textContent += `Percentage: ${data.percentage}\n`;
            textContent += `Add Courses: ${data.totalCourses}\n`;
            textContent += `Total Credits: ${data.totalCredits}\n`;
            textContent += `Total Grade Points: ${data.totalGradePoints}\n`;
            textContent += `Previous CGPA: ${data.previousCgpa}\n`;
            textContent += `Previous Credits: ${data.previousCredits}\n`;
            textContent += `Current CGPA: ${data.currentCgpa}\n`;
            textContent += `Current Credits: ${data.currentTotalCredits}\n\n`;
            textContent += "COURSES DETAILS\n";
            textContent += "-".repeat(40) + "\n";
            
            data.courses.forEach((course, index) => {
                textContent += `${index + 1}. ${course.name}\n`;
                textContent += `   Credit: ${course.credit} | Grade: ${course.grade} | Grade Point: ${course.gradePoint}\n`;
            });
            
            textContent += "\n" + "=".repeat(60) + "\n";
            textContent += "Note: This is an unofficial result. Refer to your official transcript for official CGPA.\n";
            textContent += "Generated by: IUB CGPA Calculator - N M SiAM, Developed by Noor Mohammad Siam\n";
            textContent += "Powered by - N M SiAM\n";
            
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = generateFileName(studentInfo, data) + '.txt';
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        
        // Print result function
        function printResult(studentInfo) {
            const data = getResultData(studentInfo);
            
            // Create a printable content
            let printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>CGPA Result - ${data.studentInfo.name || 'Student'}</title>
                    <style>
                        @media print {
                            @page {
                                margin: 20mm;
                            }
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 20px;
                                font-size: 12pt;
                            }
                            .no-print {
                                display: none !important;
                            }
                            .summary-item {
                                break-inside: avoid;
                            }
                            table {
                                break-inside: auto;
                            }
                            tr {
                                break-inside: avoid;
                                break-after: auto;
                            }
                            .note-section {
                                color: #e74c3c !important;
                                margin-top: 30px;
                                text-align: center;
                                border-top: 1px solid #eee;
                                padding-top: 20px;
                            }
                        }
                        @media screen {
                            body {
                                font-family: Arial, sans-serif;
                                line-height: 1.6;
                                color: #333;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .no-print {
                                display: block;
                            }
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 2px solid #2c3e50;
                            padding-bottom: 20px;
                        }
                        h1 {
                            color: #2c3e50;
                            margin-bottom: 5px;
                        }
                        .university {
                            color: #4b6cb7;
                            font-size: 1.2rem;
                            font-weight: bold;
                            margin-bottom: 10px;
                        }
                        .date {
                            color: #7f8c8d;
                            font-size: 14px;
                            margin-bottom: 20px;
                            text-align: center;
                        }
                        .student-info {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            margin-bottom: 20px;
                        }
                        .student-info h2 {
                            color: #2c3e50;
                            margin-bottom: 10px;
                            font-size: 1.2rem;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                        }
                        .info-item {
                            margin-bottom: 5px;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #7f8c8d;
                        }
                        .summary {
                            margin-bottom: 30px;
                        }
                        .summary h2 {
                            color: #2c3e50;
                            border-bottom: 1px solid #eee;
                            padding-bottom: 10px;
                        }
                        .summary-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            margin-top: 15px;
                        }
                        .summary-item {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                        }
                        .summary-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #4b6cb7;
                        }
                        .summary-label {
                            font-size: 14px;
                            color: #7f8c8d;
                            margin-top: 5px;
                        }
                        .courses {
                            margin-bottom: 30px;
                        }
                        .courses h2 {
                            color: #2c3e50;
                            border-bottom: 1px solid #eee;
                            padding-bottom: 10px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 15px;
                        }
                        th {
                            background-color: #4b6cb7;
                            color: white;
                            text-align: left;
                            padding: 12px;
                        }
                        td {
                            padding: 12px;
                            border-bottom: 1px solid #eee;
                        }
                        tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .note-section {
                            color: #e74c3c;
                            margin-top: 40px;
                            text-align: center;
                            border-top: 1px solid #eee;
                            padding-top: 20px;
                        }
                        .footer {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            font-size: 12px;
                            color: #7f8c8d;
                            text-align: center;
                        }
                        .no-print {
                            text-align: center;
                            margin-top: 30px;
                        }
                        .print-button {
                            padding: 10px 20px;
                            background: #4b6cb7;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            margin: 10px;
                        }
                        .close-button {
                            padding: 10px 20px;
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            margin: 10px;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>CGPA Result</h1>
                        <div class="university">Independent University, Bangladesh (IUB)</div>
                        <div class="date">Generated on ${data.date} at ${data.time}</div>
                    </div>
                    
                    <div class="student-info">
                        <h2>Student Information</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Name:</span> ${data.studentInfo.name || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Student ID:</span> ${data.studentInfo.studentId || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Semester:</span> ${data.studentInfo.semester || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Department:</span> ${data.studentInfo.department || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Academic Year:</span> ${data.studentInfo.academicYear || 'N/A'}
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email:</span> ${data.studentInfo.email || 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="summary">
                        <h2>Summary</h2>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-value">${data.cgpa}</div>
                                <div class="summary-label">Overall CGPA</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.percentage}</div>
                                <div class="summary-label">Percentage</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.totalCourses}</div>
                                <div class="summary-label">Add Courses</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.totalCredits}</div>
                                <div class="summary-label">Total Credits</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.previousCgpa}</div>
                                <div class="summary-label">Previous CGPA</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.previousCredits}</div>
                                <div class="summary-label">Previous Credits</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.currentCgpa}</div>
                                <div class="summary-label">Current CGPA</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-value">${data.currentTotalCredits}</div>
                                <div class="summary-label">Current Credits</div>
                            </div>
                        </div>
                        <div style="margin-top: 20px; text-align: center;">
                            <div style="font-size: 16px; color: #4b6cb7; font-weight: bold;">
                                Total Grade Points: ${data.totalGradePoints}
                            </div>
                        </div>
                    </div>
                    
                    <div class="courses">
                        <h2>Courses (${data.courses.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Course Name</th>
                                    <th>Credit</th>
                                    <th>Grade</th>
                                    <th>Grade Point</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            // Add courses data
            data.courses.forEach(course => {
                printContent += `
                    <tr>
                        <td>${course.name}</td>
                        <td>${course.credit}</td>
                        <td>${course.grade}</td>
                        <td>${course.gradePoint}</td>
                    </tr>
                `;
            });
            
            printContent += `
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="note-section">
                        <p><strong>Note:</strong> This is an unofficial result. Refer to your official transcript for official CGPA.</p>
                    </div>
                    
                    <div class="footer">
                        <p>Generated by: IUB CGPA Calculator - N M SiAM, Developed by Noor Mohammad Siam</p>
                        <p>Powered by - N M SiAM</p>
                    </div>
                    
                    <div class="button-container no-print">
                        <button class="print-button" onclick="window.print()">Print Now</button>
                        <button class="close-button" onclick="window.close()">Close Window</button>
                    </div>
                </body>
                </html>
            `;
            
            // Open print window
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                
                // Focus the window for better UX
                printWindow.focus();
            } else {
                alert('Please allow popups to print the result.');
            }
        }
    
