let user_id = '9102ba1a5b4d4f508d82250eb37a6a33';
let base_URL = 'https://api.studyplus.jp/2/timeline_feeds/user/' + user_id + '?'
var num = 0;
var all_data = [];
var la = [];
var da = [];

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
    var outputDiv = document.getElementById('data');

    for (let a = 0; a < response['feeds'].length; a++) {
        try {
            if (response['feeds'][a]['body_study_record']) {
                var e_data = response['feeds'][a]['body_study_record']

                var r_title = e_data['material_title']
                var r_length = e_data['duration'] / 60
                var r_time = e_data['record_datetime']
                var r_date = e_data['record_date']
                var r_img = e_data['material_image_url']


                let found = false;
                for (let i = 0; i < all_data.length; i++) {
                    if (all_data[i][0] === r_date) {
                        all_data[i][1] = all_data[i][1] + r_length
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    all_data.push([r_date, r_length])
                }



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
    console.log(all_data)



    //outputDiv.appendChild(p);
    if (response['next']) {
        var url = base_URL + 'until=' + response['next']
        sendGetRequest(url, displayResponse);
    } else {
        for (let o = 0; o < all_data.length; o++) {
            la.push(all_data[all_data.length - o - 1][0])
            da.push(all_data[all_data.length - o - 1][1])
        }
        graph(la, da)
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
            }],
        },
        options: {
            responsive: false,
        }
    })
}
