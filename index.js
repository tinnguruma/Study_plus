let user_id = '9102ba1a5b4d4f508d82250eb37a6a33';
//let user_id = '161090722bf64abf91b0da488aa73d6e'//sg
let base_URL = 'https://api.studyplus.jp/2/timeline_feeds/user/' + user_id + '?'
var num = 0;
var all_data = [];
var each_data = [];
var all_title = [];

// import ChartDataLabels from 'chartjs-plugin-datalabels';

// Chart.plugins.register(ChartDataLabels);

// GET送信
function sendGetRequest(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            callback(response);
        }
    };
    xhr.send();
}

// 表示というか処理
function displayResponse(response) {
    //データ回す
    for (let a = 0; a < response['feeds'].length; a++) {
        try {
            if (response['feeds'][a]['body_study_record']) {
                var e_data = response['feeds'][a]['body_study_record']
                //代入
                var r_title = e_data['material_title']
                var r_length = e_data['duration'] / 60
                var r_time = e_data['record_datetime']
                var r_date = e_data['record_date'].replace(/-/g, "")
                var r_img = e_data['material_image_url']

                if (!all_title.includes(r_title)) {
                    all_title.push(r_title)
                }

                //既存データ探索・加算代入[それぞれデータ]
                var e_found = false;
                var e_found2 = false;
                for (let j = 0; j < each_data.length; j++) {
                    if (each_data[j][0] === r_date) {
                        for (let l = 0; l < each_data[j][1].length; l++) {
                            if (each_data[j][1][l][0] == r_title) {
                                each_data[j][1][l][1] += r_length
                                e_found2 = true;
                                break;
                            }
                        }
                        if (!e_found2) {
                            each_data[j][1].push([r_title, r_length])
                        }
                        e_found = true;
                        break;
                    }
                }
                if (!e_found) {
                    each_data.push([r_date, [[r_title, r_length]]])
                }

                //[[date,[[教材,時間],[教材,時間],[教材,時間]]],[date,[[教材,時間],[教材,時間],[教材,時間]]]]


                //既存データ探索・加算代入[全体データ]
                var found = false;
                for (let i = 0; i < all_data.length; i++) {
                    if (all_data[i][0] === r_date) {
                        all_data[i][1] += r_length
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    all_data.push([r_date, r_length])
                }

                //[[date,時間],[date,時間],[date,時間]]

                //表示
                if (r_title !== '') {
                    var p = document.createElement('div');
                    var content = r_title + ': ' + r_length + '分'
                    p.innerHTML = '<div id=' + num + '-' + a + '></div>' + content + '<br>'
                    document.body.appendChild(p);
                }
            }
        } catch (e) {
            console.log(e)
            console.log(response['feeds'][a])
        }


    }

    //console.log(all_data)

    //次のデータある？
    if (response['next']) {
        var url = base_URL + 'until=' + response['next']
        sendGetRequest(url, displayResponse);
        //おしまい？
    } else {
        //全体処理
        let latest = all_data[0][0]
        let oldest = all_data[all_data.length - 1][0]
        var found = false;
        var e_found = false;

        for (let p = oldest; p <= latest; p++) {
            let found = false;
            let e_found = false;
            if (p % 100 > 32) {
            } else {
                //全体処理(p=yyyymmdd)
                for (let i = 0; i < all_data.length; i++) {
                    if (all_data[i][0] == p) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    insertArray(all_data, oldest - p, [p, 0])
                }

                if (!found) {
                    all_data.push([r_date, r_length])
                }


                //日時有無のfor
                for (let k = 0; k < each_data.length; k++) {
                    if (each_data[k][0] == p) {

                        //全教材
                        for (let s = 0; s < all_title.length; s++) {
                            if (!each_data[k][1].some(subArray => subArray.includes(all_title[s]))) {
                                each_data[k][1].push([all_title[s], 0])
                            }
                        }

                        e_found = true;
                        break;
                    }
                }
                if (!e_found) {
                    var null_data = [];
                    for (let r = 0; r < all_title.length; r++) {
                        null_data.push([all_title[r], 0])
                    }
                    insertArray(each_data, oldest - p, [p, null_data])
                }
            }
        }

        // 並び替え
        all_data.sort(function (a, b) {
            return b[0] - a[0];
        });

        // [[date,時間],[date,時間],[date,時間]]

        // 並ぶかえ2-1
        each_data.sort(function (a, b) {
            return a[0] - b[0];
        });

        // 並び替え2-2
        let result = [];
        each_data.forEach(([date, data]) => {
            data.forEach(([material, time]) => {
                let index = result.findIndex(([m, t]) => m === material);
                if (index === -1) {
                    result.push([material, [[date, time]]]);
                } else {
                    result[index][1].push([date, time]);
                }
            });
        });


        // [[date1,[[教材1,時間a],[教材2,時間b],[教材3,時間c]]....],[date2,[[教材1,時間x],[教材2,時間y],[教材3,時間z]]...]....]
        // [教材1,[[date1,時間a],[date2,時間x]...]],[教材2,[[date1,時間b],[date2,時間y]...]],[教材3,,[[date1,時間c],[date2,時間z]...]]....

        // 描画
        var la = [];
        var da = [];
        for (let o = 0; o < all_data.length; o++) {
            la.push(all_data[all_data.length - o - 1][0])
            da.push(all_data[all_data.length - o - 1][1])
        }
        graph(la, da)


        // 描画2
        // ラベル取得
        const labels = result[0][1].map(item => item[0]);
        // データセットの作成
        const datasets = result.map(item => {
            return {
                label: item[0],
                data: item[1].map(subItem => subItem[1]),
                fill: false,
                borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16), // ランダムな色を設定
                tension: 0.4,
            }
        });
        // グラフの作成
        const ctx = document.getElementById('chart2').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });


    }
    num += 1;
}



var url = base_URL;
sendGetRequest(url, displayResponse);



function graph(la, da) {
    let context = document.querySelector("#chart").getContext('2d')
    new Chart(context, {
        type: 'line',
        data: {
            labels: la,
            datasets: [{
                label: "2023年",
                data: da,
                borderColor: '#ff6347',
                backgroundColor: '#ff6347',
                tension: 0.5,
                //以降
                datalabels: {
                    color: 'rgba(200,60,60,1)',
                    font: {
                        weight: 'bold'
                    },
                    anchor: 'end', // データラベルの位置（'end' は上端）
                    align: 'end', // データラベルの位置（'end' は上側）
                    padding: {
                        bottom: 60
                    },
                    formatter: function (value, context) {
                        return value + ''; // データラベルに文字などを付け足す
                    },
                    
                },
            }],
        },

        options: {
            responsive: false,
            plugins: {
                datalabels: { // 共通の設定はここ
                    font: {
                        size: 14
                    }
                }
            }
        }
    })
}

function graph2(la, da) {
    let context = document.querySelector("#chart").getContext('2d')
    new Chart(context, {
        type: 'line',
        data: {
            labels: la,
            datasets: [{
                label: "2023年",
                data: da,
                borderColor: '#ff6347',
                backgroundColor: '#ff6347',
            }],
        },
        options: {
            responsive: false,
        }
    })
}

function insertArray(arr, index, newArr) {
    arr.splice(index, 0, newArr);
}