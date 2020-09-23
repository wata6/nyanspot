/* jshint curly:true, debug:true */
/* globals $, firebase */

/**
 * -------------------
 * 猫カフェ一覧画面関連の関数
 * -------------------
 */

// 猫カフェの表紙画像をダウンロードする
const downloadCatcafeImage = catcafeImageLocation => firebase
  .storage()
  .ref(catcafeImageLocation)
  .getDownloadURL() // catcafe-images/abcdef のようなパスから画像のダウンロードURLを取得
  .catch((error) => {
    console.error('写真のダウンロードに失敗:', error);
  });

// 猫カフェの表紙画像を表示する
const displayCatcafeImage = ($divTag, url) => {
  $divTag.find('.catcafe-item__image').attr({
    src: url,
  });
};

// Realtime Database の catcafes から猫カフェを削除する
const deleteCatcafe = (catcafeId) => {
  // TODO: catcafes から該当の猫カフェデータを削除
  firebase
    .database()
    .ref(`catcafes/${catcafeId}`)
    .remove();
};

// 猫カフェの表示用のdiv（jQueryオブジェクト）を作って返す
const createCatcafeDiv = (catcafeId, catcafeData) => {
  // HTML内のテンプレートからコピーを作成する
  const $divTag = $('#catcafe-template > .catcafe-item').clone();
  
  // 猫カフェタイトルを表示する
  $divTag.find('.catcafe-item__title').text(catcafeData.catcafeTitle);
  $divTag.find('.catcafe-item__region').text(catcafeData.catcafeRegion);
  $divTag.find('.catcafe-item__explanation').text(catcafeData.catcafeExplanation);
  $divTag.find('.catcafe-item__fee').text(catcafeData.catcafeFee);
  $divTag.find('.catcafe-item__opening').text(catcafeData.catcafeOpening);
  $divTag.find('.catcafe-item__closed').text(catcafeData.catcafeClosed);
  
  
  const catcafe = $divTag.find('.catcafe-item__title').attr('href',`#${catcafeData.catcafeTitle}`);
  // 猫カフェの表紙画像をダウンロードして表示する
  downloadCatcafeImage(catcafeData.catcafeImageLocation).then((url) => {
    displayCatcafeImage($divTag, url);
  });

  // id属性をセット
  $divTag.attr('id', `catcafe-id-${catcafeId}`);

  // 削除ボタンのイベントハンドラを登録
  const $deleteButton = $divTag.find('.catcafe-item__delete');
  $deleteButton.on('click', () => {
    deleteCatcafe(catcafeId);
  });
　
  catcafe.on('click', (e) => {
    e.preventDefault();
    $('.view').hide();
    $(`#catcafe_detail`).fadeIn();

    loadCatcafe_detailView(catcafeId);
      
  });
  return $divTag;
};

// 猫カフェ詳細の表示用のdiv（jQueryオブジェクト）を作って返す
const createCatcafe_detailDiv = (catcafeId, catcafeData) => {
  // HTML内のテンプレートからコピーを作成する
  const $divTag = $('#catcafe-detail-template > .catcafe-item').clone();
  
  // 猫カフェ情報を表示する
  $divTag.find('.catcafe-item__title').text(catcafeData.catcafeTitle);
  
  $divTag.find('.catcafe-item__address').text(catcafeData.catcafeAddress);
  
  // 猫カフェの表紙画像をダウンロードして表示する
  downloadCatcafeImage(catcafeData.catcafeImageLocation).then((url) => {
    displayCatcafeImage($divTag, url);
  });

  // id属性をセット
  $divTag.attr('id', `catcafe-id-${catcafeId}`);
  
  return $divTag;
  
};

// 猫カフェ一覧画面内の猫カフェデータをクリア
const resetCatcafeshelfView = () => {
  $('#catacfe-list').empty();
};

// 猫カフェ一覧画面に猫カフェデータを表示する
const addCatcafe = (catcafeId, catcafeData) => {
  const $divTag = createCatcafeDiv(catcafeId, catcafeData);
  $divTag.appendTo('#catcafe-list');
};

// 猫カフェ詳細画面に猫カフェデータを表示する
const addCatcafe_detail = (catcafeId, catcafeData) => {
  const $divTag = createCatcafe_detailDiv(catcafeId, catcafeData);
  $divTag.appendTo('#catcafe_detail_list');
  initMap(catcafeData.catcafeAddress);
};

// 猫カフェ一覧画面の初期化、イベントハンドラ登録処理
const loadCatcafeshelfView = () => {
  resetCatcafeshelfView();

  // 猫カフェデータを取得
  const catcafesRef = firebase
    .database()
    .ref('catcafes')
    .orderByChild('createdAt');

  // 過去に登録したイベントハンドラを削除
  catcafesRef.off('child_removed');
  catcafesRef.off('child_added');

  // catcafes の child_removedイベントハンドラを登録
  // （データベースから猫カフェが削除されたときの処理）
  catcafesRef.on('child_removed', (catcafeSnapshot) => {
    const catcafeId = catcafeSnapshot.key;
    const $catcafe = $(`#catcafe-id-${catcafeId}`);

    // TODO: 猫カフェ一覧画面から該当の猫カフェデータを削除する
    $catcafe.remove();
  });

  // catcafes の child_addedイベントハンドラを登録
  // （データベースに猫カフェが追加保存されたときの処理）
  catcafesRef.on('child_added', (catcafeSnapshot) => {
    const catcafeId = catcafeSnapshot.key;
    const catcafeData = catcafeSnapshot.val();

    // 猫カフェ一覧画面に猫カフェデータを表示する
    addCatcafe(catcafeId, catcafeData);
  });
};

// 猫カフェ詳細画面
const loadCatcafe_detailView = (catcafeID) => {
  const catcafeRef = firebase
    .database()
    .ref(`catcafes/${catcafeID}`);

    
  // 過去に登録したイベントハンドラを削除

  catcafeRef.off('value');

  // イベントハンドラを登録
  catcafeRef.on('value', (catcafeSnapshot) => {
    const catcafeId = catcafeSnapshot.key;
    const catcafeData = catcafeSnapshot.val();
    addCatcafe_detail(catcafeId, catcafeData);
    
  });
  
};

function initMap(address) {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: -34.397, lng: 150.644 }
  });
  const geocoder = new google.maps.Geocoder();
  document.getElementById("submit").addEventListener("click", () => {
    const address = document.getElementById("add-catcafe-address").value;
    geocodeAddress(geocoder, map,address);
  });
  
  if(address){
    const map1 = new google.maps.Map(document.getElementById("map1"), {
      zoom: 15,
      center: { lat: -34.397, lng: 150.644 }
    });
    geocodeAddress(geocoder, map1,address);
  };
}

function geocodeAddress(geocoder, resultsMap,address) {
  
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      resultsMap.setCenter(results[0].geometry.location);
      new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}


/**
 * ----------------------
 * すべての画面共通で使う関数
 * ----------------------
 */

// ビュー（画面）を変更する
const showView = (id) => {
  $('.view').hide();
  $(`#${id}`).fadeIn();

  if (id === 'catcafeshelf') {
    loadCatcafeshelfView();
  } 
  
};

/**
 * -------------------------
 * ログイン・ログアウト関連の関数
 * -------------------------
 */

// ログインフォームを初期状態に戻す
const resetLoginForm = () => {
  $('#login__help').hide();
  $('#login__submit-button')
    .prop('disabled', false)
    .text('ログイン');
};

// ログインした直後に呼ばれる
const onLogin = () => {
  console.log('ログイン完了');

  // 猫カフェ一覧画面を表示
  showView('catcafeshelf');
};

// ログアウトした直後に呼ばれる
const onLogout = () => {
  const catcafesRef = firebase.database().ref('catcafes');

  // 過去に登録したイベントハンドラを削除
  catcafesRef.off('child_removed');
  catcafesRef.off('child_added');

  showView('login');
};

/**
 * ------------------
 * イベントハンドラの登録
 * ------------------
 */

// ログイン状態の変化を監視する
firebase.auth().onAuthStateChanged((user) => {
  // ログイン状態が変化した
  if (user) {
    // ログイン済

    onLogin();
  } else {
    // 未ログイン
    onLogout();
  }
});

// ログインフォームが送信されたらログインする
$('#login-form').on('submit', (e) => {
  e.preventDefault();

  const $loginButton = $('#login__submit-button');
  $loginButton.text('送信中…');

  const email = $('#login-email').val();
  const password = $('#login-password').val();

  // ログインを試みる
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      // ログインに成功したときの処理
      console.log('ログインしました。');
      
      // ログインフォームを初期状態に戻す
      resetLoginForm();
    })
    .catch((error) => {
      // ログインに失敗したときの処理
      console.error('ログインエラー', error);
      
      $('#login__help')
        .text('ログインに失敗しました。')
        .show();

      // ログインボタンを元に戻す
      $loginButton.text('ログイン');
    });
});

// ログアウトボタンが押されたらログアウトする
$('.logout-button').on('click', () => {
  firebase
    .auth()
    .signOut()
    .catch((error) => {
      console.error('ログアウトに失敗:', error);
    });
});

/**
 * -------------------------
 * 猫カフェ情報追加モーダル関連の処理
 * -------------------------
 */

// 猫カフェの登録モーダルを初期状態に戻す
const resetAddCatcafeModal = () => {
  $('#catcafe-form')[0].reset();
  $('#add-catcafe-image-label').text('');
  $('#submit_add_catcafe')
    .prop('disabled', false)
    .text('保存する');
};

// 選択した表紙画像の、ファイル名を表示する
$('#add-catcafe-image').on('change', (e) => {
  const input = e.target;
  const $label = $('#add-catcafe-image-label');
  const file = input.files[0];

  if (file != null) {
    $label.text(file.name);
  } else {
    $label.text('ファイルを選択');
  }
});

// 猫カフェの登録処理
$('#catcafe-form').on('submit', (e) => {
  e.preventDefault();

  // 猫カフェの登録ボタンを押せないようにする
  $('#submit_add_catcafe')
    .prop('disabled', true)
    .text('送信中…');

  // 猫カフェタイトル
  const catcafeTitle = $('#add-catcafe-title').val();
  const catcafeRegion = $('#add-catcafe-region').val();
  const catcafeExplanation = $('#add-catcafe-explanation').val();
  const catcafeFee = $('#add-catcafe-fee').val();
  const catcafeOpening = $('#add-catcafe-opening').val();
  const catcafeClosed = $('#add-catcafe-closed').val();
  const catcafeAddress = $('#add-catcafe-address').val();

  const $catcafeImage = $('#add-catcafe-image');
  const { files } = $catcafeImage[0];

  if (files.length === 0) {
    // ファイルが選択されていないなら何もしない
    return;
  }

  const file = files[0]; // 表紙画像ファイル
  const filename = file.name; // 画像ファイル名
  const catcafeImageLocation = `catcafe-images/${filename}`; // 画像ファイルのアップロード先

  // 猫カフェデータを保存する
  firebase
    .storage()
    .ref(catcafeImageLocation)
    .put(file) // Storageへファイルアップロードを実行
    .then(() => {
      // Storageへのアップロードに成功したら、Realtime Databaseに猫カフェデータを保存する
      const catcafeData = {
        catcafeTitle,
        catcafeRegion,
        catcafeExplanation,
        catcafeFee,
        catcafeOpening,
        catcafeClosed,
        catcafeImageLocation,
        catcafeAddress,        
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      };
      return firebase
        .database()
        .ref('catcafes')
        .push(catcafeData);
    })
    .then(() => {
      // 猫カフェ一覧画面の猫カフェの登録モーダルを閉じて、初期状態に戻す
      $('#add-catcafe-modal').modal('hide');
      resetAddCatcafeModal();
    })
    .catch((error) => {
      // 失敗したとき
      console.error('エラー', error);
      resetAddCatcafeModal();
      $('#add-catcafe__help')
        .text('保存できませんでした。')
        .fadeIn();
    });
});
