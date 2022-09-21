# valorant-game-status

<!-- Description -->
- 玩家狀態無需啟動 Valorant 或 Riot Mobile

<!-- Shields -->
</center>
<hr></hr>

![Showcase](https://i.imgur.com/0YImzjU.png)

## 📥 安裝
- 在 Linux 上安裝

    1. 複製程式碼

  ```sh
  git clone https://github.com/WindowsedCS/valorant-game-status
  ```

  或是使用[`gh`](https://cli.github.com)

  ```sh
  gh repo clone WindowsedCS/valorant-game-status
  ```

    2. 安裝所需套件

  ```sh
  npm install
  ```

    3. 填寫`config.example.js`並重新命名成`config.js` 
  ```shell
  mv config.example.js config.js
  ```
  
    4. 啟動機器人

  ```sh
  node index.js
  npm start
  ```

- 在 Windows 上安裝

    1. 複製程式碼

  ```batch
  git clone
  ```

    2. 安裝所需套件

  ```batch
  npm install
  ```

    3. 填寫`config.example.js`並重新命名成`config.js`

    4. 啟動機器人

  ```batch
  npm start
  ```

###  設定檔
- 設置 `config.js` `.env`
<table>
<th>設定檔名稱</th>
<th>說明</th>
<tr>
<td>TOKEN</td>
<td>Discord 機器人登入 Token <a href="https://discord.com/developers/applications">Discord Developer Portal</a>.</td>
</tr>
<tr>
<td>RIOT_USERNAME</td>
<td>用戶名用來登入Riot</td>
</tr>
<tr>
<td>RIOT_PASSWORD</td>
<td>密碼用來登入Riot</td>
</tr>
<tr>
<td>STATUS_BOARD_CHANNEL_ID</td>
<td>狀態頻道ID</td>
</tr>
<tr>
<td>STATUS_BOARD_CHANNEL_ID</td>
<td>狀態訊息ID</td>
</tr>
<tr>
<td>Status</td>
<td>機器人顯示狀態</td>
</tr>

</table>

## 🙏致謝
- [valorant-xmpp-client](https://github.com/ev3nvy/valorant-xmpp-client) for the client




## Legal

This project is not affiliated with Riot Games or any of its employees and therefore does not reflect the views of said parties.
Riot Games does not endorse or sponsor this project. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
