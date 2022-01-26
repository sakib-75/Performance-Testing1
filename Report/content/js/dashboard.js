/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 48.05555555555556, "KoPercent": 51.94444444444444};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "AboutPage-1"], "isController": false}, {"data": [0.0, 500, 1500, "HomePage"], "isController": false}, {"data": [0.0, 500, 1500, "ArchivesPage"], "isController": false}, {"data": [0.0, 500, 1500, "2MinuteRulePage"], "isController": false}, {"data": [0.0, 500, 1500, "ArchivesPage-1"], "isController": false}, {"data": [0.0, 500, 1500, "AboutPage"], "isController": false}, {"data": [0.0, 500, 1500, "2MinuteRulePage-1"], "isController": false}, {"data": [0.0, 500, 1500, "2MinuteRulePage-0"], "isController": false}, {"data": [0.0, 500, 1500, "AboutPage-0"], "isController": false}, {"data": [0.0, 500, 1500, "ArchivesPage-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 360, 187, 51.94444444444444, 7771.516666666667, 474, 39519, 5338.0, 19515.9, 23221.199999999997, 37065.31, 5.272871078302136, 69.53921995378914, 0.8877801899332103], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AboutPage-1", 26, 12, 46.15384615384615, 6082.499999999999, 474, 15210, 7459.0, 13469.9, 14780.549999999997, 15210.0, 0.716470555815812, 12.594397363870593, 0.11264820262338449], "isController": false}, {"data": ["HomePage", 60, 31, 51.666666666666664, 6054.999999999998, 1037, 16399, 2559.0, 14123.8, 15577.999999999996, 16399.0, 3.102218085931441, 68.8170329546042, 0.35445265239646345], "isController": false}, {"data": ["ArchivesPage", 60, 51, 85.0, 6003.550000000001, 517, 31989, 1362.5, 20800.399999999998, 24558.999999999993, 31989.0, 1.1098163253981466, 9.691149532721084, 0.19071355409429738], "isController": false}, {"data": ["2MinuteRulePage", 60, 41, 68.33333333333333, 8936.800000000003, 1077, 39519, 2128.5, 23532.3, 37305.549999999996, 39519.0, 0.9913586570394727, 12.191162089205756, 0.2046129415676685], "isController": false}, {"data": ["ArchivesPage-1", 11, 2, 18.181818181818183, 11501.545454545454, 518, 19506, 12094.0, 19299.0, 19506.0, 19506.0, 0.2591955512618111, 11.207607352611983, 0.04151178750677443], "isController": false}, {"data": ["AboutPage", 60, 46, 76.66666666666667, 7716.833333333333, 508, 32139, 1781.5, 22074.1, 24291.849999999995, 32139.0, 1.412296393936541, 11.789111967152339, 0.2898149891723943], "isController": false}, {"data": ["2MinuteRulePage-1", 23, 4, 17.391304347826086, 6809.608695652175, 525, 14399, 5305.0, 13246.800000000001, 14227.599999999997, 14399.0, 0.4952520402230787, 14.86208223202558, 0.0817359324196292], "isController": false}, {"data": ["2MinuteRulePage-0", 23, 0, 0.0, 11734.434782608696, 2634, 27067, 9805.0, 26761.4, 27013.399999999998, 27067.0, 0.443964019611628, 0.22499806972165387, 0.06710733312743698], "isController": false}, {"data": ["AboutPage-0", 26, 0, 0.0, 9944.384615384615, 5981, 22944, 9299.5, 11518.9, 18948.399999999983, 22944.0, 0.7810387815795007, 0.42337558953408033, 0.11757825407792363], "isController": false}, {"data": ["ArchivesPage-0", 11, 0, 0.0, 9571.454545454546, 6076, 13517, 9096.0, 13199.000000000002, 13517.0, 13517.0, 0.2743142144638404, 0.13630474594763092, 0.04273983011221945], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 2, 1.0695187165775402, 0.5555555555555556], "isController": false}, {"data": ["500/Internal Server Error", 185, 98.93048128342247, 51.388888888888886], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 360, 187, "500/Internal Server Error", 185, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 2, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["AboutPage-1", 26, 12, "500/Internal Server Error", 12, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["HomePage", 60, 31, "500/Internal Server Error", 31, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["ArchivesPage", 60, 51, "500/Internal Server Error", 51, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["2MinuteRulePage", 60, 41, "500/Internal Server Error", 39, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 2, null, null, null, null, null, null], "isController": false}, {"data": ["ArchivesPage-1", 11, 2, "500/Internal Server Error", 2, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["AboutPage", 60, 46, "500/Internal Server Error", 46, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["2MinuteRulePage-1", 23, 4, "500/Internal Server Error", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
