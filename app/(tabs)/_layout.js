import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }} >
           <Tabs.Screen
             name="index"
             options={{
               title: 'Today',
               headerTitle: 'Today\'s Schedule',
               tabBarIcon: ({color, size}) => <Ionicons name='home-outline' size={size} color={color} />
             }}
           />
           <Tabs.Screen
             name="journal"
             options={{
               title: 'Journal',
               headerTitle: 'My Journal',
               tabBarIcon: ({color, size}) => <Ionicons name='book-outline' size={size} color={color} />
             }}
           />
           <Tabs.Screen
             name="plan"
             options={{
               title: 'Plan',
               headerTitle: 'My Plans',
               tabBarIcon: ({color, size}) => <Ionicons name='grid-outline' size={size} color={color} />
             }}
           />
         </Tabs>
    );
}