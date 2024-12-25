fetch('metroData.json')
    .then(response => response.json())
    .then(data => {
        const metroData = data;

        // تابع نمایش خط برای ایستگاه‌ها
        function displayLine(type) {
            const stationSelect = document.getElementById(type);
            const selectedOption = stationSelect.selectedOptions[0];
            const line = selectedOption.getAttribute("data-line");

            if (type === "start") {
                document.getElementById("start-line").innerText = `Line: ${line}`;
            } else if (type === "end") {
                document.getElementById("end-line").innerText = `Line: ${line}`;
            }
        }

        // تابع پیدا کردن مسیر
        let findRouteBtn = document.getElementById('findRoute')
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
                let result = `Route from ${start} to ${end}: ${path.join(" -> ")}`;
                document.getElementById("result").innerText = result;
            } else {
                document.getElementById("result").innerText = "No available route.";
            }
        })

        // تابع پیدا کردن مسیر با توجه به خطوط و اتصالات
        function findPath(start, end, metroData) {
            let visited = new Set();
            let queue = [{ station: start, path: [start], line: null }];

            while (queue.length > 0) {
                let current = queue.shift();
                let currentStation = current.station;
                let currentPath = current.path;
                let currentLine = current.line;

                if (currentStation === end) {
                    return currentPath;
                }

                if (visited.has(currentStation)) continue;
                visited.add(currentStation);

                // بررسی ایستگاه‌ها در همان خط
                for (let line of metroData.lines) {
                    if (line.stations.includes(currentStation)) {
                        let stationIndex = line.stations.indexOf(currentStation);

                        // ایستگاه‌های قبلی و بعدی در همان خط
                        if (stationIndex > 0) {
                            queue.push({
                                station: line.stations[stationIndex - 1],
                                path: [...currentPath, line.stations[stationIndex - 1]],
                                line: line.lineId
                            });
                        }

                        if (stationIndex < line.stations.length - 1) {
                            queue.push({
                                station: line.stations[stationIndex + 1],
                                path: [...currentPath, line.stations[stationIndex + 1]],
                                line: line.lineId
                            });
                        }
                    }
                }

                // بررسی تغییرات خط
                for (let connection of metroData.connections) {
                    if (connection.stationA === currentStation) {
                        let nextStation = connection.stationB;
                        let pathToAdd = [...currentPath, nextStation];
                        queue.push({ station: nextStation, path: pathToAdd });
                    }
                }
            }
            return null;
        }
    })
    .catch(error => console.error("Error loading metro data:", error));