<template>
    <div>
        <p>home</p>
    </div>
</template>
<script>
    export default {
        data() {
            return {
            }
        },
        mounted() {
            console.log(this.$http);
            console.log(this.$store);
            console.log('aaa');
        }
    }
</script>
<style lang="less">
    @import "style";
</style>