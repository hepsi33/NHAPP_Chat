import { Tabs } from 'expo-router';
import { Activity, MessageSquare, MoreVertical, Phone, Search, Settings, Users } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/Colors';
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.tabBarActive,
                tabBarInactiveTintColor: Colors.tabBarInactive,
                tabBarStyle: {
                    backgroundColor: Colors.background,
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerStyle: {
                    backgroundColor: Colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                },
                headerTitleStyle: {
                    color: Colors.primary,
                    fontSize: 22,
                    fontWeight: 'bold',
                },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', marginRight: 15, alignItems: 'center', gap: 20 }}>
                        <TouchableOpacity>
                            <Search color={Colors.text} size={22} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MoreVertical color={Colors.text} size={22} />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        >
            <Tabs.Screen
                name="chats"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="status"
                options={{
                    title: 'Status',
                    tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="communities"
                options={{
                    title: 'Communities',
                    tabBarIcon: ({ color }) => <Users size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="calls"
                options={{
                    title: 'Calls',
                    tabBarIcon: ({ color }) => <Phone size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
