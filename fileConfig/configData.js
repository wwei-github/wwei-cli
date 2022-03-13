module.exports = [
    {
        type: 'input', //type： input, number, confirm, list, checkbox ... 
        name: 'name', // key 名
        message: '项目命名：', // 提示信息
        default: 'my-project'// 默认值
    },
    {
        type:'list', //
        name:'usePackType', 
        message: '请选择要使用的框架',
        choices:[{
            name:'npm',
            value: 'npm',
        },{
            name:'yarn',
            value: 'yarn',
        }],
        default: 'npm',
    },
    {
        type:'list', //
        name:'useFrame', 
        message: '请选择要使用的框架',
        choices:[{
            name:'React',
            value: 'react',
        }],
        default: 'react',
    },
    {
        type:'list', //
        name:'usePack', 
        message: '请选择进行打包的工具',
        choices:[{
            name:'webpack',
            value: 'webpack',
        }],
        default: 'webpack'
    },
    {
        type:'list', //
        name:'useLanguage', 
        message: '请选择进行打包的工具',
        choices:[{
            name:'TypeScript',
            value: 'ts',
        }],
        default: 'ts'
    },
    {
        type:'list', //
        name:'useCompile', 
        message: '请选择进行打包的工具',
        choices:[{
            name:'babel',
            value: 'babel',
        }],
        default: 'babel'
    }
]