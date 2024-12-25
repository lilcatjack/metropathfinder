fetch('metroData.json')
    .then(response => response.json())
    .then(data => {
        const metroData = data;

        // بارگذاری ایستگاه‌ها در dropdown ها
        function loadStations() {
            const startSelect = document.getElementById("start");
            const endSelect = document.getElementById("end");

            // ایجاد گروه‌بندی ایستگاه‌ها برای هر خط
            metroData.lines.forEach(line => {
                const optGroupStart = document.createElement("optgroup");
                optGroupStart.label = line.name;

                const optGroupEnd = document.createElement("optgroup");
                optGroupEnd.label = line.name;

                line.stations.forEach(station => {
                    const optionStart = document.createElement("option");
                    optionStart.value = station;
                    optionStart.textContent = station;
                    optGroupStart.appendChild(optionStart);

                    const optionEnd = document.createElement("option");
                    optionEnd.value = station;
                    optionEnd.textContent = station;
                    optGroupEnd.appendChild(optionEnd);
                });

                startSelect.appendChild(optGroupStart);
                endSelect.appendChild(optGroupEnd);
            });
        }


        loadStations();

        // یافتن مسیر
        let findRouteBtn = document.getElementById('findRoute');
        findRouteBtn.addEventListener('click', () => {
            const startSelect = document.getElementById("start");
            const endSelect = document.getElementById("end");

            const start = startSelect.selectedOptions[0].value;
            const end = endSelect.selectedOptions[0].value;

            if (start === end) {
                document.getElementById("result").innerText = "Start and End stations are the same!";
                return;
            }

            let path = findPath(start, end, metroData);

            if (path) {
                let result = path.join("\n");
                document.getElementById("result").innerText = result;
            } else {
                document.getElementById("result").innerText = "No available route.";
            }
        });

        // تابع پیدا کردن مسیر
        function findPath(start, end, metroData) {
            let visited = new Set();
            let queue = [{ station: start, path: [`board in station ${start}`], line: null }];
            let changes = [];
            let currentLine = null;

            while (queue.length > 0) {
                let current = queue.shift();
                let currentStation = current.station;
                let currentPath = current.path;
                let currentLine = current.line;

                if (currentStation === end) {
                    currentPath.push(`exit at station ${currentStation}`);
                    return currentPath;
                }

                if (visited.has(currentStation)) continue;
                visited.add(currentStation);

                // بررسی ایستگاه‌ها در همان خط
                for (let line of metroData.lines) {
                    if (line.stations.includes(currentStation)) {
                        let stationIndex = line.stations.indexOf(currentStation);

                        // اگر ایستگاه قبلی در خط باشد
                        if (stationIndex > 0) {
                            queue.push({
                                station: line.stations[stationIndex - 1],
                                path: [...currentPath],
                                line: line.lineId
                            });
                        }

                        // اگر ایستگاه بعدی در خط باشد
                        if (stationIndex < line.stations.length - 1) {
                            queue.push({
                                station: line.stations[stationIndex + 1],
                                path: [...currentPath],
                                line: line.lineId
                            });
                        }
                    }
                }

                // بررسی تغییرات خط در ایستگاه امام خمینی
                for (let connection of metroData.connections) {
                    if (connection.stationA === currentStation) {
                        let nextStation = connection.stationB;
                        if (currentLine !== connection.lineTo) {
                            changes.push({
                                station: currentStation,
                                lineFrom: connection.lineFrom,
                                lineTo: connection.lineTo
                            });
                            currentLine = connection.lineTo;  // تغییر خط
                            queue.push({
                                station: nextStation,
                                path: [...currentPath, `Change to Line ${connection.lineTo} at station ${nextStation}`],
                                line: connection.lineTo
                            });
                        } else {
                            queue.push({
                                station: nextStation,
                                path: [...currentPath],
                                line: connection.lineFrom
                            });
                        }
                    }
                }
            }

            return null;
        }
    })
    .catch(error => console.error("Error loading metro data:", error));
