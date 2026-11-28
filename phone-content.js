'use strict';

window.seraPhoneContent = {
  profile: {
    name: '宵空セラ',
    x: 'https://x.com/SerapHolicx',
    site: 'https://yoizora-sera.beadedcorgi16.chatgpt.site/'
  },
  diary: [
    {date:'11/25',title:'マイクを拭いた',text:'クロスを替えたら、マイクがぴかぴかになった。掃除すると気持ちいいね。'},
    {date:'11/24',title:'本棚の整理',text:'本棚を整理しようと思ったけど、途中で本を読み始めちゃった。あと一頁だけ。'},
    {date:'11/22',title:'通販が届いた',text:'通販で頼んだものがもう届いた。ここの配送、相変わらず早いなあ。'},
    {date:'11/21',title:'古い本の余白',pinned:1,thought:'oldBook',text:'数をたどる者は、星を結ぶ。\n言葉をたどる者もまた、星を結ぶ。'},
    {date:'11/18',title:'歌の練習',text:'久しぶりに歌の練習をした。録音で聞くと、息を吸うところが思ってたより難しい。'}
  ],
  posts: {
    public: [
      {date:'11/24 18:12',text:'自己紹介ページを少し整理したよ。好きなものも増やしたから、よかったら遊びに来てね。',link:true},
      {date:'11/22 20:06',text:'今日はマイクの調整から！　次に歌う曲、ちょっとだけ練習する。'},
      {date:'11/20 17:42',text:'こんせら〜！　帰りにあったかいココア買ったよ。手があったまる〜。'},
    ],
    private: [
      {date:'11/24 23:31',text:'誰かと一緒に星座を見たい。'},
      {date:'11/24 19:02',text:'いちじく頼んだ！ たのしみ。'},
      {date:'11/23 01:16',text:'僕の知らないところで、僕のことを知ってる人がいたらいいのにな。'},
      {date:'11/22 23:10',text:'今日も本読んでたらこんな時間。'},
      {date:'11/22 00:40',text:'ひとりで見る星空、そろそろ飽きちゃった。'},
      {date:'11/21 20:20',text:'歌ってるときは、誰かが聞いてくれてる気がする。'},
      {date:'11/20 00:49',text:'誰かに見つけてもらうのって、どうしたらいいんだろ。'},
      {date:'11/18 01:12',text:'どんな世界でもいいから、僕のことを見つけてくれる人がいたらいいな。'}
    ]
  },
  photos: [
    {album:'observation',label:'観測写真 1',src:'phone-media/sky-1.webp',observation:true,date:'11/23 00:03',alt:'星座を撮った夜空の写真'},
    {album:'observation',label:'観測写真 2',src:'phone-media/sky-2.webp',observation:true,date:'11/23 00:18',alt:'星座を撮った夜空の写真'},
    {album:'observation',label:'観測写真 3',src:'phone-media/sky-3.webp',observation:true,anomaly:true,date:'11/23 00:33',alt:'星座を撮った夜空の写真'},
    {album:'observation',label:'観測写真 4',src:'phone-media/sky-4.webp',observation:true,resume:true,anomaly:true,date:'11/23 00:48',alt:'星座を撮った夜空の写真'},
    {album:'observation',label:'星座の見えない夜空',src:'phone-media/night.webp',date:'11/21 22:47',alt:'星の散った夜空'},
    {album:'observation',label:'望遠鏡のある観測室',src:'phone-media/room.webp',date:'11/22 19:20',alt:'天文台の室内'},
    {album:'daily',label:'セラの自撮り',src:'phone-media/self.webp',date:'11/24 17:46',alt:'セラの自撮り'},
    {album:'daily',label:'果物のお皿',src:'phone-media/fruit.webp',date:'11/23 20:31',alt:'果物を並べた皿'},
    {album:'daily',label:'夕暮れの街',src:'phone-media/window-dusk-photo.webp',date:'11/23 17:52',alt:'夕焼けに染まる街の屋根'},
    {album:'daily',label:'窓からの夕焼け',src:'phone-media/dusk.webp',date:'11/22 17:14',alt:'窓からの夕焼け'},
    {album:'daily',label:'セラと窓辺の猫',src:'phone-media/sera-cat.webp',date:'11/19 14:18',alt:'窓辺で眠る茶トラを抱っこするセラ'},
    {album:'daily',label:'マフラー姿のセラ',src:'phone-media/sera-mirror.webp',date:'11/18 09:44',alt:'マフラーを巻いたセラの鏡越しの自撮り'},
    {album:'daily',label:'喫茶店のパフェ',src:'phone-media/sera-parfait.webp',date:'11/17 15:22',alt:'喫茶店でいちごパフェを食べるセラ'}
  ],
  searches: [
    '自己紹介サイト 作り方','今日の流星群','いちじくのおいしい食べ方','マイク 掃除',
    '歌がうまくなる方法','カフェ いちごパフェ','別の世界の誰かに見つけてもらう方法'
  ],
  pages: [
    {title:'宵空セラの部屋',host:'yoizora-sera.beadedcorgi16.chatgpt.site',saved:true,external:true},
    {title:'別の世界の誰かに見つけてもらう方法',host:'夜窓通信｜個人観測サイト',saved:true,
      article:{
        section:'夜窓通信 / 読者の観測記録',
        intro:'誰もいないはずの夜空から、返事が来たという話を集めています。ここでは、いくつかの記録に共通する手順を紹介します。',
        parts:[
          {title:'二つの世界で同じ形を描く',text:'片方の世界で星座を作ると、門は返事を待つ。別の世界でも同じ形の星座を作って門を開くと、二つの世界がつながる。こちら側だけで形をそろえても、接続は成立しない。'},
          {title:'つながっている星座は使えない',text:'すでに二つの世界を結んでいる星座に、三つ目の世界は加われない。別の世界に呼びかけるなら、別の形の星座を使う。'},
          {title:'返事をするのは人とは限らない',text:'観測写真の中央に目のようなものが写ったという報告がある。向こうで門を開いたのは、人間ではないかもしれない。つなぐかどうかは、返事をする前に考えてほしい。'}
        ],
        image:{src:'end-omen.png',alt:'暗い夜空に浮かぶ異形の目',caption:'投稿された観測写真の拡大。撮影者不明。'}
      }},
    {title:'いちじくとはちみつのトースト',host:'台所ノート',saved:true,text:'焼いたパンにクリームチーズを塗る。切ったいちじくをのせて、はちみつを細くひと回し。'},
    {title:'声を録る前に',host:'小さな録音室',saved:true,text:'最初に静かな部屋を十秒だけ録ってみる。気づかなかった音が、あとから聞こえてくる。'},
    {title:'秋の夜空を見上げよう',host:'星空だより',saved:false,text:'月が低い夜は、街の灯りから少し離れて。五分ほど暗さに目を慣らすと、淡い星も見つけやすくなります。'}
  ],
  recordings: [
    {title:'無題',date:'11/24 23:42',duration:8},
    {title:'夜の観測',date:'11/23 00:12',duration:12,src:'phone-media/night-ambience.mp3',waveform:[56, 72, 88, 66, 54, 38, 44, 48, 71, 84, 82, 76, 59, 38, 43, 56, 79, 74, 95, 63, 48, 39, 38, 60, 78, 76, 78, 54]},
    {title:'マイクテスト',date:'11/22 20:04',duration:7},
    {title:'歌の練習',date:'11/18 21:02',duration:15}
  ],
  messages:[{time:'23:18',text:'こんにちは'},{time:'23:21',text:'聞こえますか？'},{time:'23:27',text:'誰かいますか？'}],
  events: [
    {day:17,time:'20:00',title:'歌の練習'},{day:19,time:'18:30',title:'本棚の整理'},
    {day:21,time:'19:00',title:'通販の注文'},{day:22,time:'20:00',title:'マイクの調整'},
    {day:23,time:'00:00',title:'夜空の観測'},{day:25,time:'22:00',title:'誰かと星座を見る',created:'11/16 23:10'}
  ],
  tracks: [
    {title:'星座になれたら',note:'歌の練習',shelf:['favorites','practice']},
    {title:'帰り道のメロディ',note:'弾き語りメモ',shelf:['recent']},
    {title:'窓辺のハミング',note:'歌の練習',shelf:['recent','practice']}
  ]
};
