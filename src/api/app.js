import enablePeriod from "@/api/enable-period.json"; // 後端連接後可刪
import user from "@/api/user-data.json"; // 後端完成後可刪

export function getUserPeriodData(){ // 獲取user的借用資料
	// 可修改區 start
	return user.periodData;
	// 可修改區 end
}
/*
	userAccount: <string>

	return:
		[
			{
				"pid": <string>,					// 每個借用時段都有一串唯一的編號, ex: "學號-年月日時分秒", "01057111-20231202193634"
				"classroomID": <string>,	// 教室代碼, ex: "ins101"
				"period": {							 // 借用時段
					"day": <int>,					 // 借用時段日期
					"startPeriod": <int>,	 // 借用時段當日的開始堂數
					"endPeriod": <int>			// 借用時段當日的結束堂數
				},
				"status": 0							 // 狀態
			},
			...
		]
*/

export function getAllUserPeriodData(){ // 獲取所有user的借用資料
	// 可修改區 start
	return user.periodData;
	// 可修改區 end
}
/*
	return:
		[
			{
				"pid": <string>,					// 每個借用時段都有一串唯一的編號, ex: "學號-年月日時分秒", "01057111-20231202193634"
				"classroomID": <string>,	// 教室代碼, ex: "ins101"
				"period": {               // 借用時段
					"day": <int>,					  // 借用時段日期
					"startPeriod": <int>,	  // 借用時段當日的開始堂數
					"endPeriod": <int>			// 借用時段當日的結束堂數
				},
				"status": 0               // 狀態
			},
			...
		]
*/

export function getEnablePeriodData(classroomID){ // 跟後端拿某間教室的可借時段
	// 可修改區 start
	if (classroomID in enablePeriod) return enablePeriod[classroomID];
	// 可修改區 end
	return []; // 對於未開放的教室, db可以不用加那間教室的key, 當找不到key時, return [] 就可以了
}
/*
	input:
		classroomID: <string>教室ID
		
	return: (格式示範)
		[
			{ "day": 1, "startPeriod": 1, "endPeriod": 4 },
			{ "day": 2, "startPeriod": 1, "endPeriod": 9 },
			{ "day": 3, "startPeriod": 3, "endPeriod": 7 },
			...
		]
*/

export function getAllEnablePeriodData(){ // 跟後端拿全部教室的可借時段
	return enablePeriod;
}
/*
	return: (格式示範)
		{
			"ins101": [
				{ "day": 1, "startPeriod": 1, "endPeriod": 4 },
				{ "day": 2, "startPeriod": 1, "endPeriod": 9 },
				{ "day": 3, "startPeriod": 3, "endPeriod": 7 }
			],
			"ins105": [
				{ "day": 1, "startPeriod": 1, "endPeriod": 9 },
				{ "day": 2, "startPeriod": 4, "endPeriod": 9 },
				{ "day": 3, "startPeriod": 3, "endPeriod": 7 }
			],
			...
		}
*/

export function setEnablePeriod(classroomID, enablePeriod){ // 修改某間教室的可借時段
	// 可修改區 start
	alert(`[api/app/setEnablePeriod]\nclassroomID = ${classroomID}\nenablePeriod.length = ${enablePeriod.length}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		classroomID: <string>教室ID
		enablePeriod: (格式示範)
			[
				{ "day": 1, "startPeriod": 1, "endPeriod": 4 },
				{ "day": 2, "startPeriod": 1, "endPeriod": 9 },
				{ "day": 3, "startPeriod": 3, "endPeriod": 7 },
				...
			]
	userAccount: <string>
	
	return:
		if 修改成功 -> return 200
		if 修改失敗 -> return 400
*/

export function sendApply(classroomID, selectedPeriod){ // 送出借用教室的申請 (user)
	// 可修改區 start
	alert(`[api/app/sendApply]\nclassroomID = ${classroomID}\nselectedPeriod = ${selectedPeriod}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		classroomID: <string>教室ID
		selectedPeriod:
		{
			day: <int>星期幾,
			startPeriod: <int>開始節數,
			endPeriod: <int>結束節數
		}
	userAccount: <string>
		
	return:
		if 申請成功 -> return 200
		if 申請失敗 -> return 400
	
	後端操作:
		將 userData.periodData 這個 array 尾端插入一個:
		{
			"pid": "01057111-20231202193634",                          // 每個借用時段都有一串唯一的編號, ex: "學號-年月日時分秒"
			"classroomID": "ins101",                                   // 同 classroomID
			"period": { "day": 2, "startPeriod": 3, "endPeriod": 4 },  // 同 selectedPeriod
			"status": 0                                                // 0 代表"申請中"
		}
*/

export function cancelApply(pid){ // 取消教室申請 (user)
	// 可修改區 start
	alert(`[api/app/cancelApply]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i].status = 7 // 代表"已取消申請"
*/

export function deletePeriodData(pid){ // 刪除特定狀態的借用紀錄 (user) ( ex: 申請被拒絕 / 借用完畢(已還鑰匙) / 已取消申請 )
	// 可修改區 start
	alert(`[api/app/deletePeriodData]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i] 刪除
*/

export function LendKey(pid){ // 借出鑰匙 (admin)
	// 可修改區 start
	alert(`[api/app/LendKey]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i].status = 3 // 代表"申請通過(已借鑰匙)"
*/

export function ReceiveKey(pid){ // 收到歸還的鑰匙 (admin)
	// 可修改區 start
	alert(`[api/app/ReceiveKey]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i].status = 6 // 代表"借用完畢(已還鑰匙)"
*/

export function acceptRequest(pid){ // 接受一個時段申請 (admin)
	// 可修改區 start
	alert(`[api/app/acceptRequest]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i].status = 2 // 代表"申請通過(未借鑰匙)"
*/

export function rejectRequest(pid){ // 拒絕一個時段申請 (admin)
	// 可修改區 start
	alert(`[api/app/rejectRequest]\npid = ${pid}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		pid: <string>時段ID (唯一性)
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
	
	後端操作:
		1. 在 userData.periodData 內遍歷搜尋 pid 得到欲修改的借用資料索引 i
		2. 將 userData.periodData[i].status = 1 // 代表"申請被拒絕"
*/

export function getAllUserPoint(){ // 獲取所有的user的計點狀況 (admin)
	return [
		{ account: "01057900", role: 0, point: 2, banned: 1 },
		{ account: "01057901", role: 1, point: 3, banned: 0 },
		{ account: "01057902", role: 2, point: 4, banned: 0 },
	];
}
/*
	input:
		account: <string>學號(帳號)
		
	return: (將學號跟 user-data 裡的 role, point, banned 裝一起)
		[
			{ account: "01057900", role: 0, point: 2, banned: 1 },
			{ account: "01057901", role: 1, point: 3, banned: 0 },
			{ account: "01057902", role: 2, point: 4, banned: 0 },
		]
*/

export function getUserPoint(account){ // 獲取user的記點狀況 (admin)
	// 可修改區 start
	account
	return user.point;
	// 可修改區 end
}
/*
	input:
		account: <string>學號(帳號)
		
	return:
		<int>違規點數
*/

export function setUserPoint(account, point){ // 修改user的記點狀況 (admin)
	// 可修改區 start
	alert(`[api/app/setUserPoint]\naccount = ${account}\npoint = ${point}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		account: <string>學號(帳號)
		point: <int>違規點數
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
*/

export function getUserBanState(account){
	// 可修改區 start
	account
	return 0;
	// 可修改區 end
}
/*
	input:
		account: <string>學號(帳號)
		
	return:
		<int>banned
*/

export function setUserBanState(account, state){
	// 可修改區 start
	alert(`[api/app/setUserBanState]\naccount = ${account}\nstate = ${state}`); // debug
	return 200;
	// 可修改區 end
}
/*
	input:
		account: <string>學號(帳號)
		banned: <int>是否被ban
		
	return:
		if 成功 -> return 200
		if 失敗 -> return 400
*/
