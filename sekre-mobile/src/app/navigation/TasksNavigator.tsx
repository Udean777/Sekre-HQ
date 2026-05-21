import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TaskListScreen } from '@presentation/screens/tasks/TaskListScreen';
import { TaskDetailScreen } from '@presentation/screens/tasks/TaskDetailScreen';
import { CreateTaskScreen } from '@presentation/screens/tasks/CreateTaskScreen';
import { EditTaskScreen } from '@presentation/screens/tasks/EditTaskScreen';
import { colors } from '@presentation/theme';
import type { TaskId } from '@core/domain/entities/Task';

export type TasksStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: TaskId };
  CreateTask: undefined;
  EditTask: { taskId: TaskId };
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

export const TasksNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Kembali',
        headerTintColor: colors.primary[500],
        headerStyle: {
          backgroundColor: colors.surface.card,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Detail Tugas' }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Buat Tugas' }}
      />
      <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ title: 'Edit Tugas' }} />
    </Stack.Navigator>
  );
};
