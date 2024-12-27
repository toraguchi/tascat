// 位置情報を取得するフラグ
let hasLocationPermission = false;

// Google Maps APIキーを設定
const GOOGLE_MAPS_API_KEY = "AIzaSyA0hj5yFG-9OZwWcL6o0RYYieGIlax0RMw";

// 企業リスト
const companies = [
    {
        name: "丸松産業",
        phone:"09074042984",
        hours:"8:30〜16:30",
        rate: "混廃 ¥65〜/kg\n木くず ¥30〜/kg",
        address: "埼玉県新座市大和田2-231-1",
        holiday: "土日祝(第二土曜日除く)",
        memo:"11:30〜13:00 持ち込み不可",
        contract:"",
        location:{ lat: 35.8054, lng: 139.5425 }
        
    },
    { 
        name: "オネスト",
        phone:"08065635300",
        hours: "平日／7：00～18：00\n日曜日・祝／10：00～17：00",
        rate: "混廃 ¥65〜/kg\n木くず ¥35/kg",
        address: "東京都江東区新木場4-3-26",
        holiday: "第二日曜日",
        memo:"日曜日事前予約制 「前日15:00までに予約必須」",
        contract:"",
        location:{ lat: 35.643889, lng: 139.825833 }
        
    },
    { 
        name: "旭商会",
        phone:"08023813608",
        hours:"8:30〜16:30\n※全日・12:00〜13:00 持ち込み不可",
        rate: "混廃 ¥40〜/kg\n木くず ¥30/kg",
        address: "神奈川県相模原市中央区宮下本町3-28-14",
        holiday: "土日祝",
        memo:"全日事前予約制 「持込2日前に予約必須」",
        contract:"",
        location:{ lat: 35.5702, lng: 139.3607 }
    },
    { 
        name: "東港金属",
        phone:"07032439539",
        hours:"全日 00:00〜23:59（24時間営業）",
        rate: "混廃 ¥70〜/kg\n木くず ¥30/kg",
        address: "東京都大田区京浜島2-20-4",
        holiday: "年末年始",
        memo:"ー",
        contract:"",
        location:{ lat: 35.5843, lng: 139.7394 }
        
    },
    { 
        name: "亀田",
        phone:"08023813608",
        hours:"8:30〜15:00\n※全日・12:00〜13:00 持ち込み不可",
        rate: "混廃 ¥75〜/kg\n木くず ¥30/kg",
        address: "東京都墨田区東墨田2-24-19",
        holiday: "土日祝",
        memo:"ー",
        contract:"",
        location:{ lat: 35.7229, lng: 139.8338 }
        
    }
];
// 電話をかける
function callRequest(companyName) {
    const company = companies.find(c => c.name === companyName);
    if (!company || !company.phone) {
        alert("会社情報または電話番号が見つかりません");
        return;
    }

    // 電話番号にかけるためのリンクを作成
    const telLink = `tel:${company.phone}`;
    window.location.href = telLink; // 電話をかける
}
// 位置情報取得通知をリロードごとに表示
window.onload = () => {
    // ページが読み込まれるたびに位置情報を取得
    requestLocationPermission();
};

// 位置情報を取得して表示する関数
function getUserLocation() {
    if (navigator.geolocation) {
        // 位置情報取得をリクエスト
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("位置情報取得成功:", userLocation);
                calculateDistances(userLocation); // 位置情報取得後に距離計算
            },
            (error) => {
                const errorMessages = {
                    1: "位置情報の利用が許可されていません。",
                    2: "位置情報を取得できません。",
                    3: "位置情報の取得がタイムアウトしました。"
                };
                console.error("位置情報取得エラー:", error.message);
                alert(errorMessages[error.code] || "未知のエラーが発生しました。");
            },
            {
                enableHighAccuracy: true, // 高精度な位置情報を取得
                maximumAge: 0 // キャッシュを無効にする
            }
        );
    } else {
        alert("このブラウザは位置情報の取得をサポートしていません。");
    }
}

// 距離計算と企業リスト更新
function calculateDistances(userLocation) {
    const service = new google.maps.DistanceMatrixService();
    const destinations = companies.map(company => company.location);

    service.getDistanceMatrix(
        {
            origins: [userLocation],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                const results = response.rows[0].elements;
                companies.forEach((company, index) => {
                    company.distance = results[index].distance.value; // 距離（メートル）
                    company.duration = results[index].duration.text; // 移動時間（テキスト）
                });

                // 距離順に並べ替え
                companies.sort((a, b) => a.distance - b.distance);

                // 最新の企業情報を表示
                displayCompanies(userLocation);
            } else {
                // エラー詳細のログを表示
                console.error("Distance Matrix APIのエラー:", status);
                alert(`エラーが発生しました: ${status}. 詳細はコンソールで確認してください。`);

                // コンソールに追加情報を表示
                if (status === google.maps.DistanceMatrixStatus.INVALID_REQUEST) {
                    console.error("リクエストが無効です。URLのパラメータやリファラ設定を確認してください。");
                } else if (status === google.maps.DistanceMatrixStatus.MAX_ELEMENTS_EXCEEDED) {
                    console.error("最大の要素数を超えました。リクエストが多すぎます。");
                } else if (status === google.maps.DistanceMatrixStatus.OVER_QUERY_LIMIT) {
                    console.error("クエリ制限を超えました。APIのリクエスト制限を確認してください。");
                } else if (status === google.maps.DistanceMatrixStatus.REQUEST_DENIED) {
                    console.error("リクエストが拒否されました。APIキーやリファラ設定を確認してください。");
                } else if (status === google.maps.DistanceMatrixStatus.UNKNOWN_ERROR) {
                    console.error("不明なエラーが発生しました。");
                }
            }
        }
    );
}



function displayCompanies(userLocation) {
    const container = document.getElementById("company-list");
    if (!container) {
        console.error("企業リストのコンテナが見つかりません。HTML構造を確認してください。");
        return;
    }
    container.innerHTML = ""; // 初期化

    companies.forEach((company) => {
        // 各企業カードのHTMLを生成
        const card = document.createElement("div");
        card.className = "feature-item";
        card.innerHTML = `
            <h4>${company.name}</h4>
            <p>⚪︎営業時間: ${formatTextWithLineBreaks(company.hours)}</p>
            <p>⚪︎処分単価: ${formatTextWithLineBreaks(company.rate)}</p>
            <p>⚪︎住所: ${company.address}</p>
            <p>⚪︎休業日: ${company.holiday}</p>
            <p>⚪︎備考: ${company.memo}</p>            
            <p>⚪︎移動時間: ${company.duration || "計算中..."}</p>
            <p>⚪︎契約書: ${company.contract}</p>            
            <div id="map-${company.name}" style="width: 100%; height: 300px;"></div>
            <button onclick="callRequest('${company.phone}')">tel依頼</button> <!-- 電話ボタン -->
            <button onclick="openRoute('${company.name}', ${userLocation.lat}, ${userLocation.lng})">経路案内</button>
        `;
        container.appendChild(card); // コンテナにカードを追加

        // 企業の地図を表示
        const mapElement = card.querySelector(`#map-${company.name}`);
        initMap(mapElement, company.location);
    });
}
// エラーハンドリング
const errorMessages = {
    1: "位置情報の利用が許可されていません。",
    2: "位置情報を取得できません。",
    3: "位置情報の取得がタイムアウトしました。"
};

// 電話依頼の処理
function callRequest(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

// 改行をHTMLの <br> タグに変換
function formatTextWithLineBreaks(text) {
    return text.replace(/\n/g, "<br>"); // 改行を <br> タグに変換
}

// 依頼確認の2段階認証
function confirmRequest(companyName) {
    const confirmation = confirm("依頼でお間違いないですか？");
    if (confirmation) {
        sendRequest(companyName); // 確認後にメール送信
    }
}

// Google Mapを初期化して企業の位置にマーカーを追加
function initMap(mapElement, location) {
    const map = new google.maps.Map(mapElement, {
        center: location,
        zoom: 14
    });
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "企業の位置"
    });
}

function openRoute(companyName, userLat, userLng) {
    const company = companies.find(c => c.name === companyName);
    if (!company || !company.location) {
        alert("会社情報または位置情報が見つかりません");
        return;
    }

    // GoogleマップのURLを生成
    const destination = `${company.location.lat},${company.location.lng}`;
    const origin = `${userLat},${userLng}`;
    const googleMapsURL = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    // 新しいタブでGoogleマップを開く
    window.open(googleMapsURL, '_blank');
}



// 初期化
window.onload = () => {
    getUserLocation();
};