import { useBookingStore } from './src/store/useBookingStore'
import { getDateOffset } from './src/utils/date'

function runTests() {
  console.log('=== 行动不便居民服务方式校验回归测试 ===\n')

  const store = useBookingStore.getState()
  let passCount = 0
  let failCount = 0

  function test(name: string, fn: () => boolean) {
    try {
      const result = fn()
      if (result) {
        console.log(`✅ PASS: ${name}`)
        passCount++
      } else {
        console.log(`❌ FAIL: ${name}`)
        failCount++
      }
    } catch (e) {
      console.log(`❌ FAIL: ${name} - ${e}`)
      failCount++
    }
  }

  function assertEq(actual: any, expected: any, desc: string) {
    if (actual === expected) return true
    console.log(`     ${desc}: expected ${expected}, got ${actual}`)
    return false
  }

  const mobilityResident = store.residents.find((r) => r.mobilityImpaired)
  const normalResident = store.residents.find((r) => !r.mobilityImpaired && !r.isSuspended)
  const availableShifts = store.shifts.filter((s) => !s.isLeave && s.date === getDateOffset(1))

  function findShiftWithSlots() {
    for (const s of availableShifts) {
      const count = store.getShiftAppointmentCount(s.id)
      if (count < s.maxAppointments - 2) return s
    }
    return null
  }

  const availableShift = findShiftWithSlots()

  if (!mobilityResident) {
    console.log('⚠️  跳过：没有找到行动不便居民')
    return
  }
  if (!normalResident) {
    console.log('⚠️  跳过：没有找到普通居民')
    return
  }
  if (!availableShift) {
    console.log('⚠️  跳过：没有找到可用班次')
    return
  }

  console.log(`测试数据：`)
  console.log(`  行动不便居民: ${mobilityResident.name}`)
  console.log(`  普通居民: ${normalResident.name}`)
  console.log(`  可用班次: ${availableShift.barberName} ${availableShift.startTime}-${availableShift.endTime}`)
  console.log('')

  test('行动不便居民创建instore预约应被拒绝', () => {
    const err = store.createAppointment({
      residentId: mobilityResident.id,
      shiftId: availableShift.id,
      type: 'instore',
    })
    return assertEq(err, '行动不便居民只能安排上门服务', '错误消息')
  })

  test('行动不便居民创建home预约应成功', () => {
    const err = store.createAppointment({
      residentId: mobilityResident.id,
      shiftId: availableShift.id,
      type: 'home',
    })
    return assertEq(err, null, '错误消息应为空')
  })

  test('普通居民创建instore预约应成功', () => {
    const err = store.createAppointment({
      residentId: normalResident.id,
      shiftId: availableShift.id,
      type: 'instore',
    })
    return assertEq(err, null, '错误消息应为空')
  })

  test('普通居民创建home预约应成功', () => {
    const err = store.createAppointment({
      residentId: normalResident.id,
      shiftId: availableShift.id,
      type: 'home',
    })
    return assertEq(err, null, '错误消息应为空')
  })

  test('被暂停的居民创建预约应被拒绝', () => {
    const suspendedResident = store.residents.find((r) => r.isSuspended)
    if (!suspendedResident) {
      console.log('   ⚠️  跳过：没有被暂停的居民')
      return true
    }
    const err = store.createAppointment({
      residentId: suspendedResident.id,
      shiftId: availableShift.id,
      type: 'home',
    })
    return err !== null && err.includes('暂停')
  })

  test('请假班次应不可预约', () => {
    if (!availableShift) {
      console.log('   ⚠️  跳过：没有可用班次')
      return true
    }
    store.setLeave(availableShift.id, true)
    const err = store.createAppointment({
      residentId: normalResident.id,
      shiftId: availableShift.id,
      type: 'instore',
    })
    const result = err !== null && err.includes('请假')
    store.setLeave(availableShift.id, false)
    return result
  })

  console.log('')
  console.log(`=== 结果：${passCount} 通过, ${failCount} 失败 ===`)
  process.exit(failCount > 0 ? 1 : 0)
}

runTests()
