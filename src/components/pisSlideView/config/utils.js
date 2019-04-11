const formatDate = (date, type = '/') => {
  if (Object.prototype.toString.call(date) === '[Object String]') {
    date = new date();
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return [year, month, day].map(formatNumber).join(type);
};

const formatDateTime = (date, type = '-') => {
  if (!date) return;
  return formatDate(date, type) + ' ' + formatTime(date);
};

const formatTime = (date) => {
  if (!date) return;
  if (Object.prototype.toString.call(date) === '[Object String]') {
    date = new date(date);
  }
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const encodeQueryData = (data) => {
  let ret = [];
  for (let d in data) {
    if (Object.prototype.hasOwnProperty.call(data, d)) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
  }
  return ret.join('&');
};


export {
  formatDateTime,
  formatDate,
  formatTime,
  formatNumber,
  encodeQueryData

};
