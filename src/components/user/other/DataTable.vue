<template>
  <div class="ts-box borderShadow">
    <table class="main-table ts-table is-celled">
      <tbody>
        <tr>
          <td class="main-table-fliter-account" v-if="'account' in enableCol">
            <div class="ts-input is-start-icon is-solid">
              <span class="ts-icon is-magnifying-glass-icon"></span>
              <input type="text" placeholder="學號" v-model="fliter.account">
            </div>
          </td>
          <td class="main-table-fliter-id">
            <div class="ts-input is-start-icon is-solid">
              <span class="ts-icon is-magnifying-glass-icon"></span>
              <input type="text" placeholder="教室代碼" v-model="fliter.id">
            </div>
          </td>
          <td>
            <div class="ts-select is-solid">
              <select v-model="fliter.building" @change="whenBuildingChange">
                <option value="ins">資工系館</option>
                <option value="ecg">電綜大樓</option>
              </select>
            </div>
          </td>
          <td class="main-table-fliter-classroom">
            <div class="ts-select is-solid">
              <select v-model="fliter.floor" @change="whenFloorChange">
                <option
                  v-for="floor in getFloorOption()"
                  :key="floor"
                  :value="floor"
                >
                  {{ floor+"F" }}
                </option>
              </select>
            </div>
            <div class="ts-select is-solid">
              <select v-model="fliter.classroomID">
                <option
                  v-for="classroomID in getClassroomOption()"
                  :key="classroomID"
                  :value="classroomID"
                >
                  {{ classroomID }}
                </option>
              </select>
            </div>
          </td>
          <td class="main-table-fliter-period" v-if="'period' in enableCol">
            <div class="ts-select is-solid">
              <select v-model="fliter.day">
                <option value="1">星期一</option>
                <option value="2">星期二</option>
                <option value="3">星期三</option>
                <option value="4">星期四</option>
                <option value="5">星期五</option>
              </select>
            </div>
            <div class="ts-select is-solid">
              <select v-model="fliter.startPeriod" @change="whenStartPeriodChange">
                <option
                  v-for="period in getPeriod()"
                  :key="period.nth"
                  :value="period.nth"
                >
                  {{ `第 ${period.nth} 節` }}
                </option>
              </select>
            </div>
            <span>到</span>
            <div class="ts-select is-solid">
              <select v-model="fliter.endPeriod">
                <option
                  v-for="period in getPeriod()"
                  :key="period.nth"
                  :value="period.nth"
                  v-show="fliter.startPeriod != null && period.nth >= fliter.startPeriod /* 結束時段不可小於開始時段 */"
                >
                  {{ `第 ${period.nth} 節` }}
                </option>
              </select>
            </div>
          </td>
          <td v-if="'status' in enableCol">
            <div class="ts-select is-solid">
              <select v-model="fliter.status">
                <option v-for="(text, index) in statusText" :key="index" :value="index">{{ text }}</option>
              </select>
            </div>
          </td>
          <td>
            <span class="ts-icon is-caret-left-icon main-table-resetButton iconButton" title="重置篩選器" @click="resetFliter">
              <span class="ts-icon is-rotate-right-icon"></span>
            </span>
          </td>
        </tr>
        <tr>
          <td v-if="'account' in enableCol">{{ enableCol.account }}</td>
          <td><span class="ts-icon is-hashtag-icon"></span></td>
          <td>大樓</td>
          <td>教室名稱</td>
          <td v-if="'period' in enableCol">{{ enableCol.period }}</td>
          <td v-if="'status' in enableCol">{{ enableCol.status }}</td>
          <td><span class="ts-icon is-gears-icon"></span></td>
        </tr>
        <tr v-for="rowData in getTableData()" :key="rowData.classroom.id" v-show="isShow(rowData)">
          <td v-if="'account' in enableCol">{{ rowData.account }} ( {{ getPoint(rowData.account) }}違規點 )</td>
          <td>{{ rowData.classroom.id.toUpperCase() }}</td>
          <td>{{ rowData.classroom.building }}</td>
          <td class="saveButton-tdFix" style="justify-content:center;">
            {{ rowData.classroom.name }}
            <save-button :classroomID="rowData.classroom.id"/>
          </td>
          <td v-if="'period' in enableCol">{{ getPeriodText(rowData.period) }}</td>
          <td v-if="'status' in enableCol">{{ getStatusText(rowData.status) }}</td>
          <td>
            <span
              class="ts-icon is-info-icon iconButton infoIconFix"
              title="詳細教室資訊"
              @click="infoButton(rowData.classroom.id)"
            ></span>
            <span
              class="ts-icon is-x-icon iconButton-danger xIconFix"
              title="取消申請"
              v-if="tableType == 'statusPage' && (rowData.status == 0 || rowData.status == 2)"
              @click="cancelButton(rowData.pid)"
            ></span><!-- Only for status page (user). -->
            <span
              class="ts-icon is-trash-can-icon iconButton-danger trashcanIconFix"
              title="刪除"
              v-if="tableType == 'statusPage' && (rowData.status == 1 || rowData.status == 6 || rowData.status == 7)"
              @click="deleteButton(rowData.pid)"
            ></span><!-- Only for status page (user). -->
            <span
              class="ts-icon is-key-icon iconButton"
              title="借出鑰匙"
              v-if="tableType == 'overviewPage_admin' && rowData.status == 2"
              @click="lendKeyButton(rowData.pid)"
            ></span><!-- Only for overview page (admin). -->
            <span
              class="ts-icon is-key-icon iconButton"
              title="歸還鑰匙"
              v-if="tableType == 'overviewPage_admin' && rowData.status == 5"
              @click="receiveKeyButton(rowData.pid)"
            ></span><!-- Only for overview page (admin). -->
            <span
              class="ts-icon is-check-icon iconButton xIconFix"
              title="同意申請"
              v-if="tableType == 'requestPage_admin'"
              @click="acceptButton(rowData.pid)"
            ></span><!-- Only for request page (admin). -->
            <span
              class="ts-icon is-x-icon iconButton-danger xIconFix"
              title="拒絕申請"
              v-if="tableType == 'requestPage_admin'"
              @click="rejectButton(rowData.pid)"
            ></span><!-- Only for request page (admin). -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  import floor_config from "@/assets/floor/floor-config.json"; // 平面圖排版的設定檔
  import schedule_config from "@/assets/schedule-config.json"; // 課表時段的設定檔
  import { getClassroomInfo } from "@/assets/import"; // 查詢教室資訊
  import saveButton from "@/components/user/other/SaveButton.vue"; // 收藏按鈕comp
  import { getRole } from "@/api/auth";
  import { cancelApply, deletePeriodData, LendKey, ReceiveKey, acceptRequest, rejectRequest } from "@/api/app";
  import { getUserPoint } from "@/api/app";

  export default{
    components: {
      "save-button": saveButton
    },
    props: {
      tableType: { default: null }, // 表格類型
      enableCol: { default: {} }, // 要啟用哪幾列
      insertData: { default: [] } // 要插入表格的數筆資料
    },
    data(){
      return {
        fliter: null, // resetFliter() will init
        statusText: [
          "申請中",
          "申請被拒絕",
          "申請通過 ( 未借鑰匙 )",
          "申請通過 ( 已借鑰匙 )",
          "借用中",
          "借用完畢 ( 未還鑰匙 )",
          "借用完畢 ( 已還鑰匙 )",
          "已取消申請"
        ],
        userPoint: {}
      }
    },
    created(){
      this.resetFliter();
    },
    methods: {
      getFloorOption(){ // 獲取樓層選項
        try{
          return Object.keys(floor_config.B[this.fliter.building].F);
        }catch{null}
        return [];
      },
      getClassroomOption(){ // 獲取教室id選項
        try{
          return Object.keys(floor_config.B[this.fliter.building].F[this.fliter.floor].C);
        }catch{null}
        return [];
      },
      getPeriod(){ // 獲取有哪幾節課
        return schedule_config.periodTime;
      },
      
      whenBuildingChange(){ // 如果大樓改變,重置樓層和教室id
        this.fliter.floor = "";
        this.fliter.classroomID = "";
      },
      whenFloorChange(){ // 如果樓層改變.重置教室id
        this.fliter.classroomID = "";
      },
      whenStartPeriodChange(){ // 如果開始時段改變,將結束時段設為開始時段
        this.fliter.endPeriod = this.fliter.startPeriod;
      },
      resetFliter(){ // 重置篩選列
        this.fliter = {
          account: "",
          id: "",
          building: "",
          floor: "",
          classroomID: "",
          day: null,
          startPeriod: null,
          endPeriod: null,
          status: null
        }
      },
      isShow(rowData){ // 篩選器判斷哪一列要顯示
        let show = true;
        
        if (!rowData.account.includes(this.fliter.account)) show = false; // 學號篩選
        
        const rowData_id = rowData.classroom.id.toLowerCase() // 某一行資料的id
        const fliter_id1 = this.fliter.id.toLowerCase(); // from id搜尋框
        let fliter_id2 = this.fliter.building; // 當選擇 building: fliter_id2 = "ins" (大樓)
        if (this.fliter.classroomID == "") fliter_id2 += this.fliter.floor; // 當選擇 building+floor: fliter_id2 = "insB1" (大樓+樓層)
        else fliter_id2 += this.fliter.classroomID; // 當選擇 building+floor+classroomID: fliter_id2 = "insB03" (大樓+教室id)
        fliter_id2 = fliter_id2.toLowerCase();
        if (!rowData_id.includes(fliter_id1)) show = false;
        if (!rowData_id.includes(fliter_id2)) show = false;
        // 篩選id ( 大樓+樓層+教室id 也是一個id篩選器 )
        
        if (this.fliter.day != null && rowData.period.day != this.fliter.day) show = false; // 星期幾篩選
        if (this.fliter.startPeriod != null && this.fliter.endPeriod != null){ // 時段篩選
          if (!(this.fliter.startPeriod >= rowData.period.startPeriod && this.fliter.endPeriod <= rowData.period.endPeriod)) show = false;
          // 篩選器的時段必須在rowData的時段內
        }
        
        if (this.fliter.status != null && rowData.status != this.fliter.status) show = false; // 狀態篩選
        
        return show;
      },
      
      getTableData(){ // 將父comp輸入表格的資料整理,再插入到表格
        if (this.insertData == undefined) return [];
        
        let tableData = [];
        for (let item of this.insertData){
          const rowData = {
            pid: item.pid,
            account: (item.account == undefined) ? "" : item.account,
            classroom: getClassroomInfo(item.classroomID), // <string>classroomID 轉 <struct>classroom資料
            period: item.period,
            status: item.status
          };
          
          const classroomName = rowData.classroom.name;
          rowData.classroom.name = classroomName.slice(0, classroomName.indexOf("(")).trim(); // 縮短教室名稱,因為status表格太寬了
          
          tableData.push(rowData);
        }
        return tableData;
      },
      getPoint(account){ // 獲取user的記點
        if (!(account in this.userPoint)) this.userPoint[account] = getUserPoint(account); // 優化,不用每一筆資料都用一次api
        return this.userPoint[account];
      },
      getPeriodText(period){ // <struct>period 轉 <string>時段資訊
        const nthDay = [ "", "星期一", "星期二", "星期三", "星期四", "星期五" ];
        let periodText = "";
        if (period != undefined){
          periodText = `${nthDay[period.day]} , 第 ${period.startPeriod} 節`;
          if (period.startPeriod != period.endPeriod) periodText += ` ~ 第 ${period.endPeriod} 節`
        }
        return periodText;
      },
      getStatusText(status){ // <int>status 轉 <string>statusText
        let statusText = "未知"; // 預設狀態
        if (status != undefined) statusText = this.statusText[status];
        return statusText;
      },
      
      runConfirmDialog(questionText, resultText, f_api, pid){ // 自定義彈出式確認框,因為我不想寫n遍switch
        const result = window.confirm(`${questionText} ?`); // 彈出式確認框
        if (!result) return; // 按下取消就不執行 api
        
        const returnCode = f_api(pid); // 執行指定的 api function
        switch (returnCode){
          case 200: // api操作執行成功
            alert(`${resultText}成功 !`);
            break;
          case 400: // api操作執行失敗
            alert(`${resultText}失敗 !`);
            break;
          default: // 未知錯誤
            alert("未知錯誤");
            break;
        }
      },
      infoButton(classroomID){ // 每列資訊最右側的"i"按鈕(更多資訊)被按下
        if (getRole() == "user") this.$router.push({ name: 'floorPage', query: { id: classroomID } }); // 跳轉到平面圖頁面,並切換到特定教室
        else if (getRole() == "admin") this.$router.push({ name: 'floorPage_admin', query: { id: classroomID } });
      },
      cancelButton(pid){ // Only for status page (user) , 每列資訊最右側的"x"按鈕(取消申請)被按下
        this.runConfirmDialog("是否要取消申請", "取消申請", cancelApply, pid);
      },
      deleteButton(pid){ // Only for status page (user) , 每列資訊最右側的"垃圾桶"按鈕(刪除)被按下
        this.runConfirmDialog("是否要刪除借用紀錄", "刪除", deletePeriodData, pid);
      },
      lendKeyButton(pid){ // Only for overview page (admin), 每列資訊最右側的"鑰匙"按鈕(借出鑰匙)被按下
        this.runConfirmDialog("是否要借出鑰匙", "借用狀態更新", LendKey, pid);
      },
      receiveKeyButton(pid){ // Only for overview page (admin), 每列資訊最右側的"鑰匙"按鈕(拿到歸還的鑰匙)被按下
        this.runConfirmDialog("是否拿到了歸還的鑰匙", "借用狀態更新", ReceiveKey, pid);
      },
      acceptButton(pid){ // Only for request page (admin) , 每列資訊最右側的"v"按鈕(同意申請)被按下
        this.runConfirmDialog("是否要同意申請", "操作", acceptRequest, pid);
      },
      rejectButton(pid){ // Only for request page (admin) , 每列資訊最右側的"x"按鈕(拒絕申請)被按下
        this.runConfirmDialog("是否要拒絕申請", "操作", rejectRequest, pid);
      }
    }
  }
</script>

<style scoped>
  .iconButton{
    padding: 8px;
    border-radius: 4px;
    color: #000;
  }
  .iconButton:hover{
    background-color: #cff;
  }
  .iconButton-danger{
    padding: 8px;
    border-radius: 4px;
    color: #f00;
  }
  .iconButton-danger:hover{
    background-color: #fdd;
  }
  .infoIconFix{
    padding: 8px 12.18px;
  }
  .xIconFix{
    padding: 8px 9.55px;
  }
  .trashcanIconFix{
    padding: 8px 8.68px;
  }
  .main-table td{
    text-align: center; white-space: nowrap;
    overflow-x: hidden;
  }
  .main-table > tbody > tr:nth-child(1) > td{
    padding: 6px 8px;
  }
  .main-table > tbody > tr:nth-child(2) > td{
    background-color: #e4e4e4;
    font-weight: bold; user-select: none;
  }
  .main-table-resetButton > span.ts-icon{
    margin-left: 4px;
  }
  .main-table-fliter-account > div{
    width: 130px;
  }
  .main-table-fliter-id > div{
    width: 120px;
  }
  .main-table-fliter-classroom > div:not(:first-child){
    margin-left: 6px;
  }
  .main-table-fliter-period > div:not(:first-child){
    margin-left: 6px;
  }
  .main-table-fliter-period > span{
    margin-left: 6px;
  }
</style>