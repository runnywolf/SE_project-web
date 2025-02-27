<template>
  <div class="applyArea">
    <div class="schedule ts-box borderShadow">
      <table class="ts-table is-definition is-celled">
        <thead>
          <tr>
            <th></th><th>星期一</th><th>星期二</th><th>星期三</th><th>星期四</th><th>星期五</th>
          </tr>
        </thead>
        <tbody ref="scheduleTable" @click="clickScheduleTable">
          <tr v-for="(period, rowIndex) in periodTime" :key="rowIndex">
            <td>
              <div>第&nbsp;&nbsp;{{ period.nth }}&nbsp;&nbsp;節</div>
              {{ period.startTime }}&nbsp;~&nbsp;{{ period.endTime }}
            </td>
            <td v-for="columnIndex in 5" :key="columnIndex"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <div class="confirm box">
        <span class="confirm-emptyText" v-show="!confirm.enable">
          <span class="ts-icon is-plus-icon is-huge"></span>
          目前沒有選取任何時段，請直接點選左側的課表。
        </span>
        <span class="confirm-text" v-show="confirm.enable">
          <span class="confirm-title">[ 已選擇 ]</span><br>
          <span>
            {{ classroomInfo.building }}<br>
            {{ classroomInfo.name }}<br>
            {{ confirm.day }}&nbsp;{{ confirm.time }}&nbsp;(&nbsp;{{ confirm.period }}&nbsp;)
          </span>
        </span>
        <div class="confirm-buttons" v-show="confirm.enable">
          <button class="borderShadow ts-button is-accent" @click="clickApplyButton()">送出申請</button>
          <button class="borderShadow ts-button is-accent is-secondary" @click="resetsDP()">取消並重置</button>
        </div>
      </div>
      <div class="periodLegend box">
        <div class="ts-box is-collapsed">
          <table class="ts-table is-collapsed is-celled">
            <tbody>
              <tr v-for="legend in legendData" :key="legend.color">
                <td :style="{ width: '50px', backgroundColor: legend.color }"></td>
                <td>{{ legend.name }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import config from "@/assets/schedule-config.json"; // 課表時段的設定檔
  import { getClassroomInfo } from "@/assets/import"; // 查詢教室資訊
  import { getEnablePeriodData, getAllUserPeriodData, getUserPeriodData, sendApply } from '@/api/app';

  export default{
    props: [
      "classroomID"
    ],
    data(){
      return {
        classroomInfo: getClassroomInfo(null),
        periodTime: config.periodTime, // 第幾節,各節次的開始和結束時間
        periodState: null,
        sDP: { day: null, startPeriod: null, endPeriod: null }, // selected day & period
        confirm: { enable: false, day: "", time: "", period: "" },
        legendData: [
          { name: "選取的時段", color: "#aaf" },
          { name: "可借用", color: "#fff" },
          { name: "被別人借用", color: "#fbb" },
          { name: "被自己借用", color: "#bfb" },
          { name: "無法借用", color: "#bbb" },
        ]
      }
    },
    mounted(){
      this.initScheduleTable();
    },
    methods: {
      setCellBgColor(day, period, color){ // 更改課表某一格的顏色
        const e_table = this.$refs.scheduleTable;
        try{
          e_table.rows[period-1].cells[day].style.backgroundColor = color;
        }catch(e){true} // unknown bug
      },
      initScheduleTable(){ // 初始化課表
        const colorTable = { 0: "#fff", 1: "#fbb", 2: "#bfb", 100: "#bbb" };
        // 時段借用狀態: { 0: 可借用, 1: 已被借用, 2: 被自己借用, 100: 無法借用 }
        
        this.periodState = Array.from(Array(1+5), () => Array(this.periodTime.length+1).fill(100));
        // 生成空狀態表(表格全部填無法借用)
        
        const enablePeriod = getEnablePeriodData(this.classroomInfo.id);
        for (const p of enablePeriod){
          for (let i = p.startPeriod; i <= p.endPeriod; i++) this.periodState[p.day][i] = 0; // 更新狀態表 (0: 可借用)
        }
        // 更新狀態表(可借用)
        
        const allUserPeriodData = getAllUserPeriodData();
        for (const p of allUserPeriodData){
          if (p.classroomID == this.classroomInfo.id && (p.status == 2 || p.status == 3)){ // 教室相同,狀態介於2~5之間代表被借走
            for (let i = p.period.startPeriod; i <= p.period.endPeriod; i++) this.periodState[p.period.day][i] = 1; // 更新狀態表 (1: 已被借用)
          }
        }
        // 更新狀態表(已被借用)
        
        const userPeriodData = getUserPeriodData();
        for (const p of userPeriodData){
          if (p.classroomID == this.classroomInfo.id && (p.status == 2 || p.status == 3)){ // 教室相同,狀態介於2~5之間代表正在借用
            for (let i = p.period.startPeriod; i <= p.period.endPeriod; i++) this.periodState[p.period.day][i] = 2; // 更新狀態表 (2: 被自己借用)
          }
        }
        // 更新狀態表(被自己借用)
        
        for (let day = 1; day <= 5; day++){ // 依照狀態表,幫表格塗色
          for (let period = 1; period <= this.periodTime.length; period++){
            this.setCellBgColor(day, period, colorTable[this.periodState[day][period]]);
          }
        }
      },
      resetsDP(){ // 重設選取的節次
        if (this.sDP.day == null) return; // 如果是未選取狀態則不用重設
        
        for (let i = this.sDP.startPeriod; i <= this.sDP.endPeriod; i++) this.setCellBgColor(this.sDP.day, i, "#fff0"); // 重設格子的顏色
        this.sDP = { day: null, startPeriod: null, endPeriod: null };
        this.updateConfirmBox();
      },
      clickScheduleTable(event){ // 點擊課表的event
        const e_cell = event.target;
        if (e_cell.tagName != "TD") return; // 如果點擊了不是表格的區域,則不予理會
        
        const day = e_cell.cellIndex;
        const period = this.periodTime[e_cell.parentNode.rowIndex-1].nth;
        if (!(day >= 1 && period >= 1)) return; // 如果點擊了不是格子的區域,則不予理會
        
        if (this.periodState[day][period] != 0) return; // 如果點擊了無法選取的格子,則不予理會
        
        if (this.sDP.day == null){ // 如果還沒選時段,選取目前點的格子
          this.sDP = { day: day, startPeriod: period, endPeriod: period };
        }
        else if (day == this.sDP.day && period >= this.sDP.startPeriod-1 && period <= this.sDP.endPeriod+1){
          // 如果點選的格子介於範圍頭尾&同一天,延長範圍
          if (period == this.sDP.startPeriod-1) this.sDP.startPeriod -= 1;
          if (period == this.sDP.endPeriod+1) this.sDP.endPeriod += 1;
        }
        else{ // 如果不符合以上條件,則重設先前選取的範圍,然後選取目前點的格子
          this.resetsDP();
          this.sDP = { day: day, startPeriod: period, endPeriod: period };
        }
        this.setCellBgColor(day, period, "#aaf"); // 點擊後將格子塗色
        
        this.updateConfirmBox();
      },
      updateConfirmBox(){ // click格子,更新確認欄的內容
        this.confirm.enable = (this.sDP.day != null);
        if (!this.confirm.enable) return;
        
        const nthDay = [ "", "星期一", "星期二", "星期三", "星期四", "星期五" ];
        
        this.confirm.day = nthDay[this.sDP.day]; // 暫定
        this.confirm.time = `${this.periodTime[this.sDP.startPeriod-1].startTime}~${this.periodTime[this.sDP.endPeriod-1].endTime}`;
        const startPeriod = `${100*this.sDP.day + this.sDP.startPeriod}`;
        const endPeriod = `${100*this.sDP.day + this.sDP.endPeriod}`;
        if (this.sDP.startPeriod == this.sDP.endPeriod) this.confirm.period = startPeriod;
        else this.confirm.period = `${startPeriod}~${endPeriod}`;
      },
      clickApplyButton(){ // 按下申請按鈕
        const returnCode = sendApply(this.classroomInfo.id, this.sDP);
        switch (returnCode){
          case 200:
            alert("申請成功 !\n請至借用紀錄頁面查看最新狀態，管理員將盡速審核你的請求。\n鑰匙歸還期限為借用日後一日系辦關門前。");
            break;
          case 400:
            alert("申請失敗 !");
            break;
          default:
            alert("未知錯誤");
            break;
        }
        this.resetsDP(); // 重設選取的時段
      }
    },
    watch: {
      classroomID(newValue){
        this.classroomInfo = getClassroomInfo(newValue);
        this.resetsDP();
        this.initScheduleTable();
      }
    }
  }
</script>

<style scoped>
  .applyArea{
    margin-top: 8px;
    display: flex;
  }
  .schedule{
    white-space: nowrap;
  }
  .schedule table td, th{
    text-align: center; vertical-align: middle;
  }
  .schedule table td:first-child{
    padding: 6px;
    font-size: 11px;
  }
  .schedule table td:first-child > div{
    font-size: 14px;
  }
  .confirm{
    width: 300px; height: fit-content;
    margin-left: 8px; padding: 8px;
    display: flex; flex-direction: column; align-items: center;
  }
  .confirm-emptyText{
    margin-bottom: 8px;
    font-size: 12px;
    display: flex; flex-direction: column; align-items: center;
  }
  .confirm-emptyText > span.ts-icon{
    margin-bottom: -10px;
  }
  .confirm-title{
    font-size: 18px; font-weight: bold;
  }
  .confirm-text{
    margin: 12px 0;
    font-size: 16px; text-align: center;
  }
  .confirm-buttons{
    margin: 12px 0;
    display: flex; justify-content: space-around;
  }
  .confirm-buttons > button{
    border: none;
  }
  .confirm-buttons > button:nth-child(1):hover{
    background-color: #46c;
  }
  .confirm-buttons > button:nth-child(2){
    margin-left: 16px;
  }
  .confirm-buttons > button:nth-child(2):hover{
    background-color: #ddd;
  }
  .periodLegend{
    width: 300px; height: fit-content;
    margin: 8px 0 0 8px; padding: 8px;
  }
</style>