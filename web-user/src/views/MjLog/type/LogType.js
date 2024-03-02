
// 定义日志类型对象
export const LOG_TYPE = {
  0: { value: '0', text: '全部', color: '' },
  1: { value: '1', text: '充值', color: 'primary' },
  2: { value: '2', text: '消费', color: 'orange' },
  3: { value: '3', text: '管理', color: 'default' },
  4: { value: '4', text: '系统', color: 'secondary' }
};

// 定义渲染类型函数
export const TYPE = {
  IMAGINE: { value: 'IMAGINE', text: '绘图', color: 'info' }, 
  ACTION: { value: 'ACTION', text: '按钮变化', color: 'secondary' }, 
  INPAINT: { value: 'INPAINT', text: '局部重绘', color: 'secondary' }, 
  SHORTEN: { value: 'SHORTEN', text: 'prompt分析', color: 'info' }, 
  SWAPFACE: { value: 'SWAPFACE', text: '换脸', color: 'info' }, 
  UPSCALE: { value: 'UPSCALE', text: '放大', color: 'warning' },
  REROLL: { value: 'REROLL', text: '重绘', color: 'default' },
  VARIATION: { value: 'VARIATION', text: '变换', color: 'secondary' },
  DESCRIBE: { value: 'DESCRIBE', text: '图生文', color: 'success' }, 
  BLEAND: { value: 'BLEAND', text: '图混合', color: 'default' },
  ANOTHER_TYPE: { value: 'ANOTHER_TYPE', text: '其他类型', color: 'primary' },
};

export const CODE = {
  1: { value: 1, text: '已提交', color: 'success' }, 
  21: { value: 21, text: '排队中', color: 'warning' }, 
  22: { value: 22, text: '重复提交', color: 'warning' }, 
};

export const STATUS = {
  SUCCESS: { value: 'SUCCESS', text: '成功', color: 'success' },
  NOT_START: { value: 'NOT_START', text: '未启动', color: 'warning' },
  SUBMITTED: { value: 'SUBMITTED', text: '队列中', color: 'warning' }, 
  IN_PROGRESS: { value: 'IN_PROGRESS', text: '执行中', color: 'primary' }, 
  FAILURE: { value: 'FAILURE', text: '失败', color: 'error' }, 
};

export const MODE = {
  turbo: { value: 'turbo', text: 'Turbo', color: 'secondary' },
  relax: { value: 'relax', text: 'Relax', color: 'warning' },
  fast: { value: 'fast', text: 'Fast', color: 'info' }, 
};

