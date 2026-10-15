package br.com.planner.pos

import android.view.View
import android.view.ViewGroup
import android.widget.*
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk=[28], qualifiers="w360dp-h640dp-xhdpi")
class TelaServidorAcessibilidadeTest {
 private fun todos(v: View): List<View> = listOf(v) + if(v is ViewGroup) (0 until v.childCount).flatMap { todos(v.getChildAt(it)) } else emptyList()
 @Test fun controlesUsamDensidadeRotulosERolagem() {
  val controller=Robolectric.buildActivity(TelaPosIntegradoActivity::class.java).setup()
  try {
   val activity=controller.get()
   val views=todos(activity.window.decorView)
   val density=activity.resources.displayMetrics.density
   val minTouch=(56*density+0.5f).toInt()
   val fields=views.filterIsInstance<EditText>()
   assertEquals(3,fields.size)
   fields.forEach { field ->
    assertTrue(field.minHeight>=minTouch)
    assertTrue(views.filterIsInstance<TextView>().any { it.labelFor==field.id })
   }
   views.filterIsInstance<Button>().forEach {assertTrue(it.minHeight>=minTouch)}
   assertTrue(views.filterIsInstance<ScrollView>().single().isFillViewport)
   assertFalse(fields.last().isSaveEnabled)
  } finally {controller.pause().stop().destroy()}
 }
}
