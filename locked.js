pdfMake.fonts = {
  THSarabunNew: {
      normal: 'https://sanwithz.github.io/font/THSarabunNew.ttf',
      bold: 'https://sanwithz.github.io/font/THSarabunNewBold.ttf',
      italics: 'https://sanwithz.github.io/font/THSarabunNewItalic.ttf',
  }
};

const toDataURL = url => {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
};

$(document).ready(function() {
  $('.sidebar').addClass('collapsed');
  $('.sidebar-dropdown-menu').slideUp('fast');

  $('.sidebar-menu-item.has-dropdown > a, .sidebar-dropdown-menu-item.has-dropdown > a').click(function(e) {
    e.preventDefault();
    $('.sidebar-dropdown-menu').css('overflow-y', 'hidden');
    if(!($(this).parent().hasClass('focused'))) {
      $(this).parent().parent().find('.sidebar-dropdown-menu').slideUp('fast');
      $(this).parent().parent().find('.has-dropdown').removeClass('focused');
    }
    $(this).next().slideToggle('fast');
    $(this).parent().toggleClass('focused');
  });

  $('.sidebar-menu-item > a').click(function(e) {
    if(!$(this).parent().hasClass('has-dropdown')) {
      if(window.innerWidth < 768) {
        $('.sidebar').addClass('collapsed');
      }
      
      $(this).closest('.sidebar-dropdown-menu').slideUp('fast');
      $(this).closest('.has-dropdown').removeClass('focused');
    }
  });

  $('.sidebar-toggle').click(function() {
    $('.sidebar').toggleClass('collapsed');

    $('.sidebar.collapsed').mouseleave(function() {
      $('.sidebar-dropdown-menu').slideUp('fast');
      $('.sidebar-menu-item.has-dropdown, .sidebar-dropdown-menu-item.has-dropdown').removeClass('focused');
    });
  });

  $('.sidebar-overlay').click(function() {
    $('.sidebar').addClass('collapsed');
    $('.sidebar-dropdown-menu').slideUp('fast');
    $('.sidebar-menu-item.has-dropdown, .sidebar-dropdown-menu-item.has-dropdown').removeClass('focused');
  });

  if(window.innerWidth < 768) {
    $('.sidebar').addClass('collapsed');
  }
});

let systemData = {};

const updateSystemDisplay = (data) => {
  systemData = {
    logoUrl: data[7],
    nameThai: data[8],
    nameEng: data[9]
  };

  $("#textLoginEng").text(systemData.nameEng);
  $("#textLoginthai").text(systemData.nameThai);
  $("#logoLogin").attr("src", systemData.logoUrl);
  $("#textSystemEng").text(systemData.nameEng);
  $("#textSystemThai").text(systemData.nameThai);
  $("#logoSystem").attr("src", systemData.logoUrl);
  $("#loaderLogo").attr("src", systemData.logoUrl);
};

$(document).ready(function () {
  $("#customLoader").show();
  google.script.run.withSuccessHandler(data => {
    data.forEach((value, index) => {
      $(`#setData${index + 1}`).val(value);
    });
    updateSystemDisplay(data);
    showGetDataUsers();
    checkAllInputs();
  }).getSet();

  loadingAPI().then(() => {
    $("#customLoader").hide();
  });
});

const addSetting = () => {
  $("#customLoader").show();
  let data = {};
  for (let i = 1; i <= 10; i++) {
    data[`set${i}`] = document.getElementById(`setData${i}`).value;
  }
  google.script.run.withSuccessHandler(response => {
    $("#xModalsetting").click();
    google.script.run.withSuccessHandler(data => {
      updateSystemDisplay(data);
    }).getSet();
    $("#customLoader").hide();
    createToast("🛠️ บันทึกการตั้งค่าสำเร็จ", 1);
    renderAlertData();
    updateAlertBadge();
  }).settingGS(data);
};

const loadingAPI = async () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    $("#pageformLogin").show();
    $("#dashboardPage").hide();
    $("#customLoader").hide();
    return;
  }

  $("#pageformLogin").hide();
  $("#dashboardPage").show();
  $("#customLoader").show();

  try {
    await fetchAllData();
    updateAllDropdownsFrom();
    updateCountsHomes();
    const allChartDates = [
      ...allDataOrders.map(r => r[1]),
      ...allDataLogMaterial_DB.map(r => r[2]),
      ...allDataLogPWStock.map(r => r[2]),
      ...allDataOrdersPWStock.map(r => r[1])
    ].map(date => {
      const [d, m, y] = date.split(/\/| /);
      return `${y}-${m.padStart(2, '0')}`;
    });
    initFilters(allChartDates);
    renderMaterialCharts();
    $("#customLoader").hide();
    renderAlertData();
    updateAlertBadge();
  } catch (err) {
    $("#customLoader").hide();
    createToast("❌ โหลดข้อมูลล้มเหลว", 3);
  }
};

const setDisPlayMenu = (status, menuItems) => {
  const allMenuItems = Object.keys(menuItems);
  allMenuItems.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = "none";
    }
  });
  for (const item in menuItems) {
    if (menuItems[item][status]) {
      const element = document.getElementById(item);
      if (element) {
        element.style.display = "block";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    localStorage.removeItem('uiduser');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('fullname');
    localStorage.removeItem('agency');
    localStorage.removeItem('department');
    localStorage.removeItem('role');
    localStorage.removeItem('imgUser');
    localStorage.removeItem('sigUser');
    localStorage.removeItem('isLoggedIn');
    updateAllDropdowns();
  } else {
    let datauser = {
    uiduser: localStorage.getItem('uiduser'),
    username: localStorage.getItem('username'),
    password: localStorage.getItem('password'),
    fullname: localStorage.getItem('fullname'),
    agency: localStorage.getItem('agency'),
    department: localStorage.getItem('department'),
    role: localStorage.getItem('role'),
    imgUser: localStorage.getItem('imgUser'),
    sigUser: localStorage.getItem('sigUser')
    };
    google.script.run.withSuccessHandler(function(menuItems) {
      setDisPlayMenu(datauser.role, menuItems);
    }).getMenuItems();
    loginUserSuc(datauser);
  }
  
  const storedUsername = localStorage.getItem("usernameSave");
  const storedPassword = localStorage.getItem("passwordSave");
  const storedChecked = localStorage.getItem("checked");

  if (storedUsername) {
    document.getElementById("loginusername").value = storedUsername;
  }
  if (storedPassword) {
    document.getElementById("loginpassword").value = storedPassword;
  }
  if (storedChecked === "checked") {
    document.getElementById("rememberMe").checked = true;
  }
});

const loginUsers = async () => {
  event.preventDefault();
  $("#customLoader").show();

  const usernameCheck = $("#loginusername").val();
  const passwordCheck = $("#loginpassword").val();
  const rememberMe = document.getElementById("rememberMe");

  google.script.run.withSuccessHandler(function(datauser) {
    if (typeof datauser === 'object' && datauser !== null) {
      createToast("🔓 เข้าสู่ระบบสำเร็จ " + datauser.fullname, 1);
      localStorage.setItem('uiduser', datauser.uiduser);
      localStorage.setItem('username', datauser.username);
      localStorage.setItem('password', datauser.password);
      localStorage.setItem('fullname', datauser.fullname);
      localStorage.setItem('agency', datauser.agency);
      localStorage.setItem('department', datauser.department);
      localStorage.setItem('role', datauser.role);
      localStorage.setItem('imgUser', datauser.imgUser);
      localStorage.setItem('sigUser', datauser.sigUser);
      localStorage.setItem('isLoggedIn', 'true');

      if (rememberMe.checked) {
        localStorage.setItem('usernameSave', usernameCheck);
        localStorage.setItem('passwordSave', passwordCheck);
        localStorage.setItem('checked', 'checked');
      } else {
        localStorage.removeItem('usernameSave');
        localStorage.removeItem('passwordSave');
        localStorage.removeItem('checked'); 
      }

      loginUserSuc(datauser);
      google.script.run.withSuccessHandler(menuItems => {
        setDisPlayMenu(datauser.role, menuItems);
      }).getMenuItems();

      loadingAPI().then(() => {
        $("#customLoader").hide();
      });

      renderAlertData();
      updateAlertBadge();

    } else if (typeof datauser === 'string') {
      $("#customLoader").hide();
      createToast(datauser, 3);
      $("#pageformLogin").show();
      $("#dashboardPage").hide();
    } else {
      $("#customLoader").hide();
      createToast("❌ ไม่พบข้อมูลผู้ใช้งาน กรุณาตรวจสอบอีกครั้ง", 3);
      $("#pageformLogin").show();
      $("#dashboardPage").hide();
    }
  }).checkUsers(usernameCheck, passwordCheck);
};

const loginUserSuc = (datauser) => {
  $("#pageformLogin").hide();
  $("#dashboardPage").show();
  $('#user-show0').html(datauser.uiduser);
  $('#user-show1').html(datauser.username);
  $('#user-show2').html(datauser.fullname);
  $('#user-show3').html(datauser.role);
  $('#userProfileImage').attr('src', datauser.imgUser);

  $('#editFirstName').val(datauser.fullname);
  $('#editUsername').val(datauser.username);
  $('#editPassword').val(datauser.password || '');
  $('#editFirstName').val(datauser.fullname);

  if (datauser.imgUser) {
    $('#editProfilePictureArea').css('background-image', `url(${datauser.imgUser})`)
      .find('.upload-icon, .upload-text').hide();
  } else {
    $('#editProfilePictureArea').css('background-image', '')
      .find('.upload-icon, .upload-text').show();
  }

  if (datauser.sigUser) {
    $('#editSignatureArea').css('background-image', `url(${datauser.sigUser})`)
      .find('.upload-icon, .upload-text').hide();
  } else {
    $('#editSignatureArea').css('background-image', '')
      .find('.upload-icon, .upload-text').show();
  }

};

const logoutUsers = async () => {
  $("#customLoader").show();
  if (localStorage.getItem('isLoggedIn') === 'true') {
    const checkedSave = localStorage.getItem('checked');
    localStorage.removeItem('uiduser');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('fullname');
    localStorage.removeItem('agency');
    localStorage.removeItem('department');
    localStorage.removeItem('role');
    localStorage.removeItem('imgUser');
    localStorage.removeItem('sigUser');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('tempOtp');
    localStorage.removeItem('tempDatauser');

    if (checkedSave === "checked") {
      localStorage.setItem('checked', checkedSave);
    }

    $('#userProfileImage').attr('src', "");

    $("#dashboardPage").hide();
    $("#pageformLogin").show();

    const loginForm = document.getElementById('formLogin');
    const registerForm = document.getElementById('formRegister');

    loginForm.classList.remove('animate__animated', 'animate__fadeOut', 'animate__fadeIn');
    registerForm.classList.remove('animate__animated', 'animate__fadeOut', 'animate__fadeIn');

    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    loginForm.classList.add('animate__animated', 'animate__fadeIn');
    $("#customLoader").hide();
    createToast("🔓 ออกจากระบบสำเร็จ", 1);
    updateAllDropdowns();
  } else {
    $("#customLoader").hide();
    createToast("❌ ไม่สามารถออกจากระบบได้", 0);
  }
};

let apiKeyA = '';
let apiKeyB = '';
let apiKeyC = '';
let sheetWebAppA = '';
let sheetWebAppB = ''; 
let sheetWebAppC = '';
let settingsLoaded = false;

//sheetWebAppA
let allDataUsers = null;
let previousDataUsers = null;
let allDataMenu = null;
let previousDataMenu = null;
let allDataAgency = null;
let previousDataAgency = null;
let allDataDepartments = null;
let previousDataDepartments = null;

//sheetWebAppB
let allSetCategory = null;
let previousDataSetCategory = null;
let allDataMaterial = null;
let previousDataMaterial = null;
let allDataLogMaterial_DB = null;
let previousDataLogMaterial_DB = null;
let allDataOrders = null;
let previousDataOrders = null;
let allDataLogOrders = null;
let previousDataLogOrders = null;

//sheetWebAppC
let allSetUnits = null;
let previousDataSetUnits = null;
let allDataPWStock = null;
let previousDataPWStock = null;
let allDataLogPWStock = null;
let previousDataLogPWStock = null;
let allDataOrdersPWStock = null;
let previousDataOrdersPWStock = null;
let allDataLogOrdersPWStock = null;
let previousDataLogOrdersPWStock = null;
let allDataLogVerify = null;
let previousDataLogVerify = null;

const fetchSettingData = () => {
  if (typeof apiConfig !== 'undefined') {
    apiKeyA = apiConfig.idapiA;
    apiKeyB = apiConfig.idapiB;
    apiKeyC = apiConfig.idapiC;
    sheetWebAppA = apiConfig.idsheetA;
    sheetWebAppB = apiConfig.idsheetB;
    sheetWebAppC = apiConfig.idsheetC;
    settingsLoaded = true;
    console.log('✅ เชื่อมต่อสำเร็จ');
    return Promise.resolve();
  }
  
  console.error('❌ เชื่อมต่อไม่สำเร็จ');
  throw new Error('API Configuration not found');
};

async function fetchDataFromAPI(sheetId, sheetName, apiKey) {
  if (!settingsLoaded) {
    await fetchSettingData();
  }

  const apiUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetId + "/values/" + sheetName + "?alt=json&key=" + apiKey;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values) {
      console.warn(`ไม่พบข้อมูลในแผ่นงาน: ${sheetName}`);
      return [];
    }
    
    return data.values.slice(1);
  } catch (error) {
    console.error('❌ เชื่อมต่อไม่สำเร็จ', error);
    return [];
  }
}

function dataHasChanged(newData, oldData) {
  if (!oldData || newData.length !== oldData.length) return true;
  return JSON.stringify(newData) !== JSON.stringify(oldData);
}

const fetchAllData = async () => {
  await fetchSettingData();
  try {
    const [datausers, datamenu, dataagency, datadepartments, datacategory, datamateria, datalogmateria, dataorders, datalogorders, datasetunits, datapwstock, datalogpwstock, dataorderspw, dataorderslogpw, datalogverify] = await Promise.all([
      fetchDataFromAPI(sheetWebAppA, 'Users', apiKeyA),
      fetchDataFromAPI(sheetWebAppA, 'UsersMenu', apiKeyA),
      fetchDataFromAPI(sheetWebAppA, 'Agency', apiKeyA),
      fetchDataFromAPI(sheetWebAppA, 'Departments', apiKeyA),
      fetchDataFromAPI(sheetWebAppB, 'Category', apiKeyB),
      fetchDataFromAPI(sheetWebAppB, 'Material_DB', apiKeyB),
      fetchDataFromAPI(sheetWebAppB, 'LogMaterial_DB', apiKeyB),
      fetchDataFromAPI(sheetWebAppB, 'Orders', apiKeyB),
      fetchDataFromAPI(sheetWebAppB, 'LogOrders', apiKeyB),
      fetchDataFromAPI(sheetWebAppC, 'Units', apiKeyC),
      fetchDataFromAPI(sheetWebAppC, 'PaperWaterStock', apiKeyC),
      fetchDataFromAPI(sheetWebAppC, 'LogPaperWaterStock', apiKeyC),
      fetchDataFromAPI(sheetWebAppC, 'OrdersPWStock', apiKeyC),
      fetchDataFromAPI(sheetWebAppC, 'LogOrdersPWStock', apiKeyC),
      fetchDataFromAPI(sheetWebAppC, 'LogVerify', apiKeyC)
    ]);

    allDataUsers = datausers;
    allDataMenu = datamenu;
    allDataAgency = dataagency;
    allDataDepartments = datadepartments;

    allSetCategory = datacategory;
    allDataMaterial = datamateria;
    allDataLogMaterial_DB = datalogmateria;
    allDataOrders = dataorders;
    allDataLogOrders = datalogorders;

    allSetUnits = datasetunits;
    allDataPWStock = datapwstock;
    allDataLogPWStock = datalogpwstock;
    allDataOrdersPWStock = dataorderspw;
    allDataLogOrdersPWStock = dataorderslogpw;
    allDataLogVerify = datalogverify;

    await checkDataUsers(datausers);
    await checkDataMenu(datamenu);
    await checkDataAgency(dataagency);
    await checkDataDepartments(datadepartments);

    await checkDataSetCategory(datacategory);
    await checkDataMaterial(datamateria);
    await checkDataLogMaterial(datalogmateria);
    await checkDataOrders(dataorders);
    await checkDataLogOrders(datalogorders);

    await checkDataSetUnits(datasetunits);
    await checkDataPWStock(datapwstock);
    await checkDataLogPWStock(datalogpwstock);
    await checkDataOrdersPWStock(dataorderspw);
    await checkDataLogOrdersPWStock(dataorderslogpw);
    await checkDataLogVerify(datalogverify);

    return true;
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล", error);
    alert(`❌ เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`, 0);
  }
};

const updateSpecificDataUsers = async () => {
  if (!sheetWebAppA || !apiKeyA) await fetchSettingData();
  const newDataUsers = await fetchDataFromAPI(sheetWebAppA, 'Users', apiKeyA);
  await checkDataUsers(newDataUsers);
};

async function checkDataUsers(newDataUsers) {
  const isChanged = dataHasChanged(newDataUsers, previousDataUsers);
  if (isChanged) previousDataUsers = [...newDataUsers];
  allDataUsers = newDataUsers;
  await updateUsersTable();
}

async function updateUsersTable() {
  renderUsers(allDataUsers);
}

const updateSpecificDataMenu = async () => {
  if (!sheetWebAppA || !apiKeyA) await fetchSettingData();
  const newDataMenu = await fetchDataFromAPI(sheetWebAppA, 'UsersMenu', apiKeyA);
  await checkDataMenu(newDataMenu);
};

async function checkDataMenu(newDataMenu) {
  if (dataHasChanged(newDataMenu, previousDataMenu)) {
    previousDataMenu = [...newDataMenu];
    allDataMenu = newDataMenu;
    await updateMenuTable();
  }
}

async function updateMenuTable() {
  renderSetMenu(allDataMenu);
}

const updateSpecificDataAgency = async () => {
  if (!sheetWebAppA || !apiKeyA) await fetchSettingData();
  const newDataAgency = await fetchDataFromAPI(sheetWebAppA, 'Agency', apiKeyA);
  await checkDataAgency(newDataAgency);
};

async function checkDataAgency(newDataAgency) {
  if (dataHasChanged(newDataAgency, previousDataAgency)) {
    previousDataAgency = [...newDataAgency];
    allDataAgency = newDataAgency;
    await updateAgencyTable();
  }
}

async function updateAgencyTable() {
  renderAgency(allDataAgency);
}

const updateSpecificDataDepartments = async () => {
  if (!sheetWebAppA || !apiKeyA) await fetchSettingData();
  const newDataDepartments = await fetchDataFromAPI(sheetWebAppA, 'Departments', apiKeyA);
  await checkDataDepartments(newDataDepartments);
};

async function checkDataDepartments(newDataDepartments) {
  if (dataHasChanged(newDataDepartments, previousDataDepartments)) {
    previousDataDepartments = [...newDataDepartments];
    allDataDepartments = newDataDepartments;
    await updateDepartmentsTable();
  }
}

async function updateDepartmentsTable() {
  renderDepartments(allDataDepartments);
}

const updateSpecificDataSetCategory = async () => {
  if (!sheetWebAppB || !apiKeyB) await fetchSettingData();
  const newDataSetCategory = await fetchDataFromAPI(sheetWebAppB, 'Category', apiKeyB);
  await checkDataSetCategory(newDataSetCategory);
};

async function checkDataSetCategory(newDataSetCategory) {
  if (dataHasChanged(newDataSetCategory, previousDataSetCategory)) {
    previousDataSetCategory = [...newDataSetCategory];
    allSetCategory = newDataSetCategory;
    await updateSetCategoryTable();
  }
}

async function updateSetCategoryTable() {
  renderSetCategory(allSetCategory);
  renderCategoryMaterial(allSetCategory);
  renderCategoryOrders(allSetCategory);
}

const updateSpecificDataMaterial = async () => {
  if (!sheetWebAppB || !apiKeyB) await fetchSettingData();
  const newDataMaterial = await fetchDataFromAPI(sheetWebAppB, 'Material_DB', apiKeyB);
  await checkDataMaterial(newDataMaterial);
};

async function checkDataMaterial(newDataMaterial) {
  if (dataHasChanged(newDataMaterial, previousDataMaterial)) {
    previousDataMaterial = [...newDataMaterial];
    allDataMaterial = newDataMaterial;
    await updateMaterialTable();
  }
}

async function updateMaterialTable() {
  renderOrders(allDataMaterial);
  renderMaterial(allDataMaterial);
  renderMgrMaterial(allDataMaterial);
}

const updateSpecificDataLogMaterial = async () => {
  if (!sheetWebAppB || !apiKeyB) await fetchSettingData();
  const newDataLogMaterial = await fetchDataFromAPI(sheetWebAppB, 'LogMaterial_DB', apiKeyB);
  await checkDataLogMaterial(newDataLogMaterial);
};

async function checkDataLogMaterial(newDataLogMaterial) {
  if (dataHasChanged(newDataLogMaterial, previousDataLogMaterial_DB)) {
    previousDataLogMaterial_DB = [...newDataLogMaterial];
    allDataLogMaterial_DB = newDataLogMaterial;
  }
}

const updateSpecificDataOrders = async () => {
  if (!sheetWebAppB || !apiKeyB) await fetchSettingData();
  const newDataOrders = await fetchDataFromAPI(sheetWebAppB, 'Orders', apiKeyB);
  await checkDataOrders(newDataOrders);
};

async function checkDataOrders(newDataOrders) {
  if (dataHasChanged(newDataOrders, previousDataOrders)) {
    previousDataOrders = [...newDataOrders];
    allDataOrders = newDataOrders;
    await updateOrdersTable();
  }
}

async function updateOrdersTable() {
  const role = localStorage.getItem("role");
  const agency = localStorage.getItem("agency");

  let dataToRender = [];

  // if (role === "SuperAdmin" || role === "Admin1" || role === "Admin2" || role === "SuperUser") {
  if (role === "SuperAdmin") {
    dataToRender = allDataOrders;
  } else {
    dataToRender = allDataOrders.filter(order => {
      const orderAgency = order[4];
      const hasProjectCode = order[7] && order[7].trim() !== '';
      return hasProjectCode && orderAgency === agency;
    });
  }

  filteredRecOrders = dataToRender;

  renderOrdersApp(dataToRender);
  renderRecOrders(filteredRecOrders);
  updateCountsOrdersApp(dataToRender);
  renderRecMaterial(allDataOrders);
}

const updateSpecificDataLogOrders = async () => {
  if (!sheetWebAppB || !apiKeyB) await fetchSettingData();
  const newDataLogOrders = await fetchDataFromAPI(sheetWebAppB, 'LogOrders', apiKeyB);
  await checkDataLogOrders(newDataLogOrders);
};

async function checkDataLogOrders(newDataLogOrders) {
  if (dataHasChanged(newDataLogOrders, previousDataLogOrders)) {
    previousDataLogOrders = [...newDataLogOrders];
    allDataLogOrders = newDataLogOrders;
  }
}

const updateSpecificDataSetUnits = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataSetUnits = await fetchDataFromAPI(sheetWebAppC, 'Units', apiKeyC);
  await checkDataSetUnits(newDataSetUnits);
};

async function checkDataSetUnits(newDataSetUnits) {
  if (dataHasChanged(newDataSetUnits, previousDataSetUnits)) {
    previousDataSetUnits = [...newDataSetUnits];
    allSetUnits = newDataSetUnits;
    await updateSetUnitsTable();
  }
}

async function updateSetUnitsTable() {
  renderSetUnits(allSetUnits);
}

const updateSpecificDataPWStock = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataPWStock = await fetchDataFromAPI(sheetWebAppC, 'PaperWaterStock', apiKeyC);
  await checkDataPWStock(newDataPWStock);
};

async function checkDataPWStock(newDataPWStock) {
  if (dataHasChanged(newDataPWStock, previousDataPWStock)) {
    previousDataPWStock = [...newDataPWStock];
    allDataPWStock = newDataPWStock;
    await updatePWStockTable();
  }
}

async function updatePWStockTable() {
  renderPWStock(allDataPWStock);
  renderMgrPWStock(allDataPWStock);
}

const updateSpecificDataLogPWStock = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataLogPWStock = await fetchDataFromAPI(sheetWebAppC, 'LogPaperWaterStock', apiKeyC);
  await checkDataLogPWStock(newDataLogPWStock);
};

async function checkDataLogPWStock(newDataLogPWStock) {
  if (dataHasChanged(newDataLogPWStock, previousDataLogPWStock)) {
    previousDataLogPWStock = [...newDataLogPWStock];
    allDataLogPWStock = newDataLogPWStock;
  }
}

const updateSpecificDataOrdersPWStock = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataOrdersPWStock = await fetchDataFromAPI(sheetWebAppC, 'OrdersPWStock', apiKeyC);
  await checkDataOrdersPWStock(newDataOrdersPWStock);
};

async function checkDataOrdersPWStock(newDataOrdersPWStock) {
  if (dataHasChanged(newDataOrdersPWStock, previousDataOrdersPWStock)) {
    previousDataOrdersPWStock = [...newDataOrdersPWStock];
    allDataOrdersPWStock = newDataOrdersPWStock;
    await updateOrdersPWStockTable();
  }
}

async function updateOrdersPWStockTable() {
  const role = localStorage.getItem("role");
  const agency = localStorage.getItem("agency");

  let dataToRender = [];

  // if (role === "SuperAdmin" || role === "Admin1" || role === "Admin2" || role === "SuperUser") {
  if (role === "SuperAdmin") {
    dataToRender = allDataOrdersPWStock;
  } else {
    dataToRender = allDataOrdersPWStock.filter(order => order[4] === agency);
  }

  filteredRecPWStock = dataToRender;

  renderRecPWStock(filteredRecPWStock);
  updateCountsPWStockApp(dataToRender);
  renderPWStockApp(dataToRender);
}

const updateSpecificDataLogOrdersPWStock = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataLogOrdersPWStock = await fetchDataFromAPI(sheetWebAppC, 'LogOrdersPWStock', apiKeyC);
  await checkDataLogOrdersPWStock(newDataLogOrdersPWStock);
};

async function checkDataLogOrdersPWStock(newDataLogOrdersPWStock) {
  if (dataHasChanged(newDataLogOrdersPWStock, previousDataLogOrdersPWStock)) {
    previousDataLogOrdersPWStock = [...newDataLogOrdersPWStock];
    allDataLogOrdersPWStock = newDataLogOrdersPWStock;
  }
}

const updateSpecificDataLogVerify = async () => {
  if (!sheetWebAppC || !apiKeyC) await fetchSettingData();
  const newDataLogVerify = await fetchDataFromAPI(sheetWebAppC, 'LogVerify', apiKeyC);
  await checkDataLogVerify(newDataLogVerify);
};

async function checkDataLogVerify(newDataLogVerify) {
  if (dataHasChanged(newDataLogVerify, previousDataLogVerify)) {
    previousDataLogVerify = [...newDataLogVerify];
    allDataLogVerify = newDataLogVerify;
  }
}

const updateDropdowns = (dataSource, valueIndex, labelIndex, selectIds) => {
  if (!Array.isArray(dataSource) || dataSource.length === 0) return;

  const uniqueOptions = [...new Map(
    dataSource
      .filter(row => row[valueIndex] && row[labelIndex])
      .map(row => [row[valueIndex], row])
  ).values()];

  selectIds.forEach(selectId => {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
      selectElement.innerHTML = '';

      const firstOption = document.createElement("option");
      firstOption.value = '';
      firstOption.text = 'กรุณาเลือกรายการ';
      firstOption.disabled = true;
      firstOption.selected = true;
      selectElement.appendChild(firstOption);

      uniqueOptions.forEach(row => {
        const option = document.createElement("option");
        option.value = row[valueIndex];
        option.text = row[labelIndex];
        selectElement.appendChild(option);
      });
    }
  });
};

const updateAllDropdownsFrom = () => {
  const dropdownConfigs = [
    { data: allDataAgency, valueIndex: 0, labelIndex: 1, selectIds: ['dataUsers4'] },
    { data: allDataDepartments, valueIndex: 0, labelIndex: 1, selectIds: ['dataUsers5'] },
    { data: allSetCategory, valueIndex: 0, labelIndex: 1, selectIds: ['dataMrgMaterial1'] },
    { data: allSetUnits, valueIndex: 0, labelIndex: 1, selectIds: ['dataMrgMaterial4', 'dataMrgPWStock4'] }
  ];

  dropdownConfigs.forEach(config => {
    updateDropdowns(config.data, config.valueIndex, config.labelIndex, config.selectIds);
  });
};

const updateAllDropdowns = () => {
  const dropdownsConfig = [
    { functionName: 'selectAgency', selectIds: ['regisAgency'] },
    { functionName: 'selectDepartment', selectIds: ['regisDepartment'] }
  ];

  dropdownsConfig.forEach(config => {
    updateDropdownss(config.functionName, config.selectIds);
  });
}

const updateDropdownss = (functionName, selectIds) => {
  google.script.run.withSuccessHandler((options) => {
    populateSelectElements(selectIds, options);
  })[functionName]();
}

const populateSelectElements = (selectIds, options) => {
  selectIds.forEach(selectId => {
    let selectElement = document.getElementById(selectId);
    if (selectElement) {
      selectElement.innerHTML = '';

      let defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.text = "กรุณาเลือกรายการ";
      defaultOption.selected = true;
      selectElement.appendChild(defaultOption);

      options.forEach(item => {
        let option = document.createElement("option");
        option.value = item.id;
        option.text = item.name;
        selectElement.appendChild(option);
      });
    }
  });
};

const changePage = (data) => {
  localStorage.setItem('currentPage', data);
  for (let i = 1; i <= 20; i++) {
    $("#page" + i).toggle(i === data);
  }
  $('.sidebar-menu-item').removeClass('active-home').addClass('active-setting');
  $("#manuLi" + data).removeClass('active-setting').addClass('active-home');
  $(".sidebar-menu-item:last").removeClass('active-setting active-home').addClass('active-close');
  if(window.innerWidth < 768) {
    $('.sidebar').addClass('collapsed');
  }
}

const savedPage = localStorage.getItem('currentPage');
if (savedPage) {
  changePage(parseInt(savedPage));
} else {
  changePage(1);
}

const createToast = (message, status, delay = 1000 * 5) => {
  const toast = document.createElement('div');
  toast.className = 'border-0';
  toast.classList.add('toast', 'show');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  if (status == 1) {
    toast.style.backgroundColor = 'var(--bs-blue)';
    toast.style.color = 'var(--bs-white)';
  } else if (status == 0) {
    toast.style.backgroundColor = 'var(--bs-red)';
    toast.style.color = 'var(--bs-white)';
  } else if (status == 2) {
    toast.style.backgroundColor = 'var(--bs-green)';
    toast.style.color = 'var(--bs-white)';
  } else if (status == 3) {
    toast.style.backgroundColor = 'var(--bs-purple)';
    toast.style.color = 'var(--bs-white)';
  } else if (status == 4) {
    toast.style.backgroundColor = 'var(--bs-blue)';
    toast.style.color = 'var(--bs-white)';
  }

  const header = document.createElement('div');
  header.classList.add('toast-header', 'rounded-bottom-0');

  const img = document.createElement('img');
  img.src = systemData.logoUrl || 'https://www.step.cmu.ac.th/CCS/Files/images/STeP-LOGO-semi.png';
  img.classList.add('rounded', 'me-2');
  img.style.width = '20px';
  img.alt = 'Logo';

  const strong = document.createElement('strong');
  strong.classList.add('me-auto');
  strong.innerText = systemData.nameThai || '';

  const small = document.createElement('small');
  small.classList.add('text-body-secondary');
  let secondsElapsed = 0;
  small.innerText = `ตอนนี้`;

  const interval = setInterval(() => {
    secondsElapsed += 1;
    small.innerText = `${secondsElapsed} วินาทีที่แล้ว`;
  }, 1000);

  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('btn-close');
  button.setAttribute('data-bs-dismiss', 'toast');
  button.setAttribute('aria-label', 'Close');
  button.onclick = () => {
    toast.remove();
    clearInterval(interval);
  };

  header.append(img, strong, small, button);

  const body = document.createElement('div');
  body.classList.add('toast-body');
  body.style.fontSize = '14px';
  body.innerText = message;

  toast.append(header, body);

  document.getElementById('toast-container').appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
      clearInterval(interval);
    });
  }, delay);

  const alertType = ['danger', 'error', 'success', 'info', 'notice'][status] || 'info';
  const newLog = {
    status: message,
    idstatus: new Date().toLocaleTimeString('th-TH'),
    type: alertType,
    name: localStorage.getItem('fullname') || 'ระบบ'
  };

  const oldLogs = JSON.parse(localStorage.getItem('alertLogs') || '[]');
  const alertLogs = [newLog, ...oldLogs].slice(0, 50);
  localStorage.setItem('alertLogs', JSON.stringify(alertLogs));
};

const renderAlertData = () => {
  const container = document.getElementById('sendes-log');
  const bellIcon = document.querySelector('.set-icons');
  container.innerHTML = '';

  const data = JSON.parse(localStorage.getItem('alertLogs') || '[]');
  const userImg = localStorage.getItem('imgUser') || systemData.logoUrl || '';

  if (data.length === 0) {
    container.innerHTML = `
      <div class="text-center p-4">
        <i class="fa-solid fa-bell-slash fs-3 text-secondary mb-2"></i>
        <p class="fw-bold text-muted mb-0">ไม่มีแจ้งเตือน</p>
      </div>`;
    bellIcon.classList.remove('bx-tada');
    return;
  }

  data.forEach(item => {
    const icon = item.type === 'success' ? ''
                : item.type === 'error' ? ''
                : item.type === 'info' ? ''
                : '';

    const element = `
      <div class="px-3 py-2 d-flex align-items-start gap-2 border-bottom">
        <img src="${userImg}" alt="user" class="rounded-circle" width="30" height="30">
        <div class="flex-grow-1" style="font-size: 12px;">
          <div class="fw-semibold text-dark mb-1" style="line-height: 1.4; font-size: 13px;">
            ${icon} ${item.status}
          </div>
          <div class="text-muted d-flex justify-content-between" style="font-size: 10px;">
            <span>👤 ${item.name}</span>
            <span>🕒 ${item.idstatus}</span>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += element;
  });

  bellIcon.classList.add('bx-tada');
};

const updateAlertBadge = () => {
  const alerts = JSON.parse(localStorage.getItem('alertLogs') || '[]');
  const badge = document.getElementById('alertBadge');
  const bellIcon = document.querySelector('.set-icons');

  if (alerts.length > 0) {
    badge.innerText = alerts.length;
    badge.style.display = 'inline-block';
    bellIcon.classList.add('bx-tada');
  } else {
    badge.innerText = '';
    badge.style.display = 'none';
    bellIcon.classList.remove('bx-tada');
  }
};

const clearAllAlerts = () => {
  localStorage.removeItem('alertLogs');
  renderAlertData();
  updateAlertBadge();
}
